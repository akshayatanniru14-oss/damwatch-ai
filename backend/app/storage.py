from fastapi import UploadFile
import os
from pathlib import Path
from uuid import uuid4
from fastapi.responses import FileResponse

UPLOAD_DIRECTORY = "uploads"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

def save_file(file: UploadFile) -> str:
    file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    return file_location

def get_file(file_name: str) -> FileResponse:
    file_location = os.path.join(UPLOAD_DIRECTORY, file_name)
    return FileResponse(file_location)


async def save_uploaded_file(file: UploadFile) -> str:
    extension = Path(file.filename or "").suffix.lower()
    file_path = Path(UPLOAD_DIRECTORY) / f"{uuid4().hex}{extension}"
    content = await file.read()
    file_path.write_bytes(content)
    return str(file_path)