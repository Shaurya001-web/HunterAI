import sys
import os
# Add the backend directory to Python path so Vercel can find the modules!
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables BEFORE any module imports that depend on them
from dotenv import load_dotenv
_config_env = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config", ".env")
load_dotenv(_config_env)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.file_upload import router as file_upload_router
from routes.user_router import router as user_router
from routes.matches_router import router as matches_router
from config.database import engine, Base
import config.models # Ensure models are loaded

# Create database tables
Base.metadata.create_all(bind=engine)



app = FastAPI(
    title="Internship Hunter API",
    description="Backend services for parsing resumes, scraping job listings, and running the matching engine.",
    version="1.0.0"
)

# Configure CORS
# Read allowed origins from env (comma-separated list), fallback to '*' to allow easy integration
_cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
_allowed_origins: list[str] = (
    [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
    if _cors_origins_env
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include sub-routers
app.include_router(file_upload_router, tags=["File Upload"])
app.include_router(user_router, tags=["User Profiles"])
app.include_router(matches_router, tags=["Job Matching"])

@app.get("/")
def home():
    return {
        "message": "Welcome to Internship Hunter API! 🎯",
        "endpoints": {
            "docs": "/docs",
            "upload_resume": "/file/upload/resume [POST]",
            "profiles": "/profiles [GET]",
            "jobs": "/jobs [GET]",
            "matches": "/matches [GET]"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
