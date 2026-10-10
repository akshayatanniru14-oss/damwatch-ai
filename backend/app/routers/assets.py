from fastapi import APIRouter
from fastapi.responses import JSONResponse
import json
import os

router = APIRouter()

@router.get("/assets")
async def get_assets():
    try:
        with open(os.path.join(os.path.dirname(__file__), '../../data/assets.geojson')) as f:
            data = json.load(f)
        return JSONResponse(content=data)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)