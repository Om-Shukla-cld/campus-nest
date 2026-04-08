from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/campusnest"
    # Fallback to SQLite for local dev
    SQLITE_URL: str = "sqlite:///./campusnest.db"
    USE_SQLITE: bool = True  # Set False for PostgreSQL

    # JWT
    SECRET_KEY: str = "campusnest-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # OTP (Demo)
    DEMO_OTP: str = "1234"
    OTP_EXPIRE_MINUTES: int = 10

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB

    # App
    APP_NAME: str = "CampusNest"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ALLOWED_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
