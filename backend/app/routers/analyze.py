import json
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from app.ai_service import analyze_images
from app.schemas import AnalyzeResponse
from app.storage import save_uploaded_file

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    images: List[UploadFile] = File(..., min_length=1, max_length=3),
    note: str = Form(..., max_length=500),
    asset: str = Form(..., min_length=1),
    coordinates: Optional[str] = Form(None),
    water_level: Optional[str] = Form(None),
):
    try:
        image_paths = []
        for image in images:
            image_path = await save_uploaded_file(image)
            image_paths.append(image_path)

        parsed_coordinates = json.loads(coordinates) if coordinates else None
        return await analyze_images(
            image_paths, note, asset, parsed_coordinates, water_level
        )
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail="coordinates must be valid JSON") from exc