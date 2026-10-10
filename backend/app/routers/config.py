from fastapi import APIRouter

router = APIRouter()

@router.get("/config")
async def get_config():
    return {
        "model_name": "Gemma 4",
        "version": "1.0.0",
        "description": "DamWatch AI configuration endpoint"
    }