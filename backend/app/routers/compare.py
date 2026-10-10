from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import aiofiles
import os
import shutil
from app.ai_service import analyze_images

router = APIRouter()

class CompareRequest(BaseModel):
    old_image: UploadFile = File(...)
    new_image: UploadFile = File(...)
    old_note: str
    new_note: str

class CompareResponse(BaseModel):
    change_detected: bool
    change_summary: str
    changes: List[dict]
    updated_severity: str
    recommended_action: str

@router.post("/api/compare", response_model=CompareResponse)
async def compare_images(request: CompareRequest):
    old_image_path = f"uploads/{request.old_image.filename}"
    new_image_path = f"uploads/{request.new_image.filename}"

    async with aiofiles.open(old_image_path, 'wb') as out_file:
        content = await request.old_image.read()
        await out_file.write(content)

    async with aiofiles.open(new_image_path, 'wb') as out_file:
        content = await request.new_image.read()
        await out_file.write(content)

    try:
        response = await analyze_images(old_image_path, new_image_path, request.old_note, request.new_note)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))