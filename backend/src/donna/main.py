"""Main FastAPI application."""

from datetime import datetime
from pathlib import Path

from fastapi import Depends, FastAPI, File, UploadFile
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


@app.post("/api/v1/voice/capture")
async def capture_voice(
    audio: UploadFile = File(...), current_user: dict = Depends(get_current_user)
):
    """
    Capture and process voice recording.

    This endpoint receives audio recordings from the frontend,
    saves them temporarily, and will process them with AI for natural language capture.
    """
    try:
        # Create recordings directory if it doesn't exist
        recordings_dir = Path("data/recordings")
        recordings_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        user_id = current_user["id"]
        filename = f"{user_id}_{timestamp}.webm"
        file_path = recordings_dir / filename

        # Save the audio file
        content = await audio.read()
        with open(file_path, "wb") as f:
            f.write(content)

        # TODO: Process audio with speech-to-text (Whisper API)
        # TODO: Extract structured data (tasks, projects, people, deadlines) with AI
        # TODO: Save to markdown files in user's data directory

        return {
            "success": True,
            "message": "Voice recording captured successfully",
            "filename": filename,
            "size": len(content),
            "timestamp": timestamp,
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to process recording: {str(e)}",
        }
