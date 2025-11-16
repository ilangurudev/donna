"""Application configuration."""

import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv

# Load environment variables from .env file if it exists
# Look for .env in the backend directory (3 levels up from config.py)
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(env_path)


class Settings:
    """Application settings."""

    APP_NAME: str = "Donna"
    VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # CORS settings
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"
    ).split(",")

    # API settings
    API_PREFIX: str = "/api/v1"

    # Supabase settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")


settings = Settings()
