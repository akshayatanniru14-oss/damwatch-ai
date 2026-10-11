from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.ai_service import compare_images
from app.schemas import CompareResponse
from app.storage import save_uploaded_file

router = APIRouter()


@router.post("/compare", response_model=CompareResponse)
async def compare(
    old_image: Annotated[UploadFile, File(...)],
    new_image: Annotated[UploadFile, File(...)],
    old_note: Annotated[str, Form()] = "",
    new_note: Annotated[str, Form()] = "",
) -> CompareResponse:
    if not (old_image.content_type or "").startswith("image/") or not (
        new_image.content_type or ""
    ).startswith("image/"):
        raise HTTPException(status_code=415, detail="Both files must be images")
    old_path = await save_uploaded_file(old_image)
    new_path = await save_uploaded_file(new_image)
    return await compare_images(old_path, new_path, old_note, new_note)
