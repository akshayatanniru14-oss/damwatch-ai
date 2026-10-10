from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analyze, compare, reports, assets, config
import os

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router, prefix="/api")
app.include_router(compare.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(config.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the DamWatch AI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)