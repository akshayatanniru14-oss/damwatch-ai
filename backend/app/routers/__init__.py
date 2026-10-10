# File: /damwatch-ai/damwatch-ai/backend/app/routers/__init__.py

from fastapi import APIRouter

router = APIRouter()

from . import analyze, compare, reports, assets, config

router.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
router.include_router(compare.router, prefix="/compare", tags=["Compare"])
router.include_router(reports.router, prefix="/reports", tags=["Reports"])
router.include_router(assets.router, prefix="/assets", tags=["Assets"])
router.include_router(config.router, prefix="/config", tags=["Config"])