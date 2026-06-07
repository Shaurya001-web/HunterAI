import sys
import os
# Add the backend directory to Python path so Vercel can find the modules!
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.file_upload import router as file_upload_router
from routes.user_router import router as user_router
from routes.matches_router import router as matches_router
from config.database import engine, Base
import config.models # Ensure models are loaded

# Create database tables
Base.metadata.create_all(bind=engine)

def seed_database():
    from config.database import SessionLocal
    from config.models import Job
    from routes.matches_router import generate_platform_jobs
    
    db = SessionLocal()
    try:
        if db.query(Job).count() == 0:
            print("Seeding default jobs in database...")
            default_keywords = ["python", "machine learning", "web development"]
            for kw in default_keywords:
                jobs = generate_platform_jobs(kw)
                for sj in jobs:
                    existing = db.query(Job).filter(
                        Job.title == sj["job_title"],
                        Job.company == sj["company"]
                    ).first()
                    if not existing:
                        new_job = Job(
                            title=sj["job_title"],
                            company=sj["company"],
                            skills=sj["required_skills"],
                            location=sj.get("location"),
                            stipend=sj.get("stipend"),
                            duration=sj.get("duration"),
                            url=sj.get("url"),
                            source=sj.get("source")
                        )
                        db.add(new_job)
            db.commit()
            print("Database seeded successfully! ✅")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

seed_database()

app = FastAPI(
    title="Internship Hunter API",
    description="Backend services for parsing resumes, scraping job listings, and running the matching engine.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local MVP development
    allow_credentials=False, # Must be False if origins is "*"
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
