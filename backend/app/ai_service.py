import base64
import json
import mimetypes
import os
from pathlib import Path
from typing import Any, Iterable, TypeVar

import httpx
from fastapi import HTTPException
from dotenv import load_dotenv

from app.schemas import AnalyzeResponse, CompareResponse

load_dotenv(override=True)

ModelResponse = TypeVar("ModelResponse")


ANALYSIS_PROMPT = """You are DamWatch AI, a cautious civil-infrastructure inspection
assistant. Analyze the supplied dam, canal, or reservoir photos together with the
inspector's notes. Return ONLY a JSON object with exactly these keys:
issue_detected (string), issue_category (one of seepage, crack, debris_blockage,
encroachment, erosion, gauge_damage, water_level_anomaly, vegetation, other,
none_visible), severity (one of low, medium, high, critical), evidence_strength
(one of weak, moderate, strong), evidence_reason (string), visual_evidence (array
of strings describing visible evidence), recommended_action (string), escalation
(string), data_gaps (array of strings), checklist (array of strings).

Do not infer defects that are not visible. If the images are unclear, say so in
evidence_reason and list the missing information in data_gaps. This is preliminary
visual triage, not a safety certification. Keep emergency recommendations
proportionate to the evidence."""


def _image_part(path: str) -> dict[str, Any]:
    image_path = Path(path)
    try:
        image_bytes = image_path.read_bytes()
    except OSError as exc:
        raise HTTPException(
            status_code=400, detail=f"Unable to read uploaded image: {image_path.name}"
        ) from exc

    mime_type = mimetypes.guess_type(image_path.name)[0] or "application/octet-stream"
    if not mime_type.startswith("image/"):
        raise HTTPException(status_code=415, detail=f"Unsupported image type: {mime_type}")

    return {
        "inlineData": {
            "mimeType": mime_type,
            "data": base64.b64encode(image_bytes).decode("ascii"),
        }
    }


def _response_text(response_json: dict[str, Any]) -> str:
    try:
        return response_json["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="Gemma returned no usable analysis") from exc


def _parse_json_text(text: str, response_type: type[ModelResponse]) -> ModelResponse:
    cleaned = text.strip().replace("```json", "").replace("```", "").strip()
    object_start = cleaned.find("{")
    if object_start < 0:
        raise ValueError("Gemma response did not contain a JSON object")
    cleaned = cleaned[object_start:]
    try:
        parsed, _ = json.JSONDecoder().raw_decode(cleaned)
        return response_type.model_validate(parsed)
    except (json.JSONDecodeError, ValueError) as exc:
        raise ValueError("Gemma returned invalid JSON or invalid report fields") from exc


def _parse_model_response(response_json: dict[str, Any]) -> AnalyzeResponse:
    try:
        return _parse_json_text(_response_text(response_json), AnalyzeResponse)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Gemma returned invalid analysis JSON") from exc


def _parse_json_response(response_json: dict[str, Any], response_type: type[ModelResponse]) -> ModelResponse:
    try:
        return _parse_json_text(_response_text(response_json), response_type)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Gemma returned invalid comparison JSON") from exc


async def _generate_content(
    client: httpx.AsyncClient,
    url: str,
    api_key: str,
    parts: list[dict[str, Any]],
) -> dict[str, Any]:
    payload = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }
    response = await client.post(url, params={"key": api_key}, json=payload)
    response.raise_for_status()
    try:
        return response.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Gemma returned a non-JSON API response")


async def _generate_with_json_retry(
    client: httpx.AsyncClient,
    url: str,
    api_key: str,
    parts: list[dict[str, Any]],
    response_type: type[ModelResponse],
) -> ModelResponse:
    for attempt in range(2):
        response_json = await _generate_content(client, url, api_key, parts)
        try:
            return _parse_json_text(_response_text(response_json), response_type)
        except ValueError:
            if attempt == 0:
                parts = parts + [
                    {
                        "text": (
                            "Return valid JSON only. Do not use markdown or explanations. "
                            "Match the required schema exactly."
                        )
                    }
                ]
            else:
                raise HTTPException(
                    status_code=502,
                    detail="Gemma returned invalid analysis JSON after one retry",
                )
    raise HTTPException(status_code=502, detail="Gemma analysis failed")


async def analyze_images(
    image_paths: Iterable[str],
    note: str,
    asset: str,
    coordinates: dict[str, float] | None = None,
    water_level: str | None = None,
) -> dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured")

    model = os.getenv("GEMMA_MODEL", "gemma-4-26b-a4b-it")
    context = (
        f"Asset: {asset}\n"
        f"Inspector note: {note}\n"
        f"Coordinates: {coordinates or 'not provided'}\n"
        f"Water level: {water_level or 'not provided'}"
    )
    parts: list[dict[str, Any]] = [{"text": f"{ANALYSIS_PROMPT}\n\n{context}"}]
    parts.extend(_image_part(path) for path in image_paths)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            result = await _generate_with_json_retry(
                client, url, api_key, parts, AnalyzeResponse
            )
    except httpx.HTTPStatusError as exc:
        detail = "Gemma request failed"
        try:
            detail = exc.response.json().get("error", {}).get("message", detail)
        except ValueError:
            pass
        raise HTTPException(status_code=502, detail=detail) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail="Unable to reach Gemma") from exc

    return result.model_dump()


async def compare_images(
    old_image_path: str, new_image_path: str, old_note: str, new_note: str
) -> dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY is not configured")

    prompt = f"""You are DamWatch AI, comparing two inspection photos of the same
infrastructure location. The first image is OLDER and the second is NEWER.
Describe only visible changes; do not claim deterioration when angle, lighting,
or image quality makes comparison uncertain.

Older inspector note: {old_note or "not provided"}
Newer inspector note: {new_note or "not provided"}

Return ONLY JSON with exactly these keys:
change_detected (boolean), change_summary (string), changes (array of objects
with observation and direction, where direction is worsened, improved, or unchanged),
updated_severity (low, medium, high, or critical), recommended_action (string).
This is preliminary visual triage, not a safety certification."""
    parts = [{"text": prompt}, _image_part(old_image_path), _image_part(new_image_path)]
    model = os.getenv("GEMMA_MODEL", "gemma-4-26b-a4b-it")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            result = await _generate_with_json_retry(
                client, url, api_key, parts, CompareResponse
            )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail="Gemma comparison request failed") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail="Unable to reach Gemma") from exc
    return result.model_dump()
