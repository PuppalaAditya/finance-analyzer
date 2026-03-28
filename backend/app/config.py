import os
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Financial Decoder AI"
    ENV: str = Field("development", env="ENV")

    GEMINI_API_KEY: str = Field("", env="GEMINI_API_KEY")
    # Default to current public model IDs (without "models/" prefix)
    GEMINI_MODEL: str = Field("gemini-1.5-flash", env="GEMINI_MODEL")
    # text-embedding-004 deprecated Jan 2026; use gemini-embedding-001
    GEMINI_EMBEDDING_MODEL: str = Field(
        "gemini-embedding-001", env="GEMINI_EMBEDDING_MODEL"
    )

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")

    class Config:
        case_sensitive = True
        env_file = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

