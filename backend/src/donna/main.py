"""Main FastAPI application."""

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from donna.auth import get_current_user
from donna.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Donna FastAPI Backend",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint returning a welcome message."""
    return {"message": "Welcome to Donna API", "version": settings.VERSION}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/v1/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user information from JWT token.

    This is a protected endpoint that requires authentication.
    """
    return {
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "role": current_user["role"],
        }
    }
