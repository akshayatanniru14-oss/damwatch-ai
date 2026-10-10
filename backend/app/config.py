from pydantic import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    gemma_model: str = "gemma-4-26b-a4b-it"
    database_url: str = "sqlite:///./database.db"
    uploads_dir: str = "./uploads"
    max_image_size: int = 10 * 1024 * 1024  # 10 MB

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()