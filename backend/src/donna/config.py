"""Application configuration."""

import os
from typing import List


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


settings = Settings()
