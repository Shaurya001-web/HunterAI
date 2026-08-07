from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from routes.auth import get_current_user
from config.models import User
from config.database import get_db

router = APIRouter()

def serialize_user_profile(user: User):
    prof = user.profile
    return {
        "user_id": user.id,
        "name": user.username or user.email.split("@")[0],
        "email": user.email,
        "skills": prof.skills if prof and prof.skills else [],
        "education": prof.education if prof and prof.education else [],
        "experience": prof.experience if prof and prof.experience else [],
        "projects": prof.projects if prof and prof.projects else [],
        "saved_internships": prof.saved_internships if prof and prof.saved_internships else [],
        "urls": user.urls or {},
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return serialize_user_profile(current_user)

@router.get("/profiles")
async def get_user_profiles_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Keep compatibility with any list endpoints
    return [serialize_user_profile(current_user)]

@router.post("/profile")
async def save_user_profile(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if "username" in payload:
        current_user.username = payload["username"]
    if "urls" in payload:
        # Expecting a dictionary, e.g. {"linkedin": "...", "github": "..."}
        current_user.urls = payload["urls"]
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return serialize_user_profile(current_user)

from config.models import Profile, Job

@router.get("/profile/saved")
async def get_saved_internships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prof = current_user.profile
    if not prof or not prof.saved_internships:
        return []
    saved_ids = prof.saved_internships
    jobs = db.query(Job).filter(Job.id.in_(saved_ids)).all()
    return [
        {
            "id": j.id,
            "job_title": j.title,
            "company": j.company,
            "score": 85.0,
            "location": j.location,
            "stipend": j.stipend,
            "duration": j.duration,
            "url": j.url,
            "matched_skills": j.skills,
            "missing_skills": [],
            "source": j.source
        }
        for j in jobs
    ]

@router.post("/profile/saved")
async def save_internship(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_id = payload.get("job_id")
    if not job_id:
        raise HTTPException(status_code=400, detail="Missing job_id")
    prof = current_user.profile
    if not prof:
        prof = Profile(user_id=current_user.id, saved_internships=[])
        db.add(prof)
    
    saved = list(prof.saved_internships or [])
    if job_id not in saved:
        saved.append(job_id)
        prof.saved_internships = saved
        db.commit()
    return {"message": "Internship saved successfully"}

@router.delete("/profile/saved/{job_id}")
async def unsave_internship(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prof = current_user.profile
    if prof and prof.saved_internships:
        saved = list(prof.saved_internships)
        if job_id in saved:
            saved.remove(job_id)
            prof.saved_internships = saved
            db.commit()
    return {"message": "Internship unsaved successfully"}

