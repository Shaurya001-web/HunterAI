from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from routes.auth import get_current_user
from config.models import User, Profile, Match, Job
from config.database import get_db

router = APIRouter()

def serialize_profile(user: User, profile: Profile):
    return {
        "user_id": user.id,
        "name": user.name or "",
        "email": user.email,
        "skills": profile.skills if profile else [],
        "education": profile.education if profile else [],
        "experience": profile.experience if profile else [],
        "projects": profile.projects if profile else [],
        "saved_internships": profile.saved_internships if (profile and hasattr(profile, "saved_internships")) else []
    }

@router.get("/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please upload your resume.")
    return serialize_profile(current_user, profile)

@router.get("/profiles")
async def get_user_profiles_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        return []
    return [serialize_profile(current_user, profile)]

@router.post("/profile")
async def save_user_profile(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # Update name in User table if provided
    if "name" in payload and payload["name"]:
        current_user.name = payload["name"]
        db.add(current_user)

    if not profile:
        profile = Profile(
            user_id=current_user.id,
            skills=payload.get("skills", []),
            education=payload.get("education", []),
            experience=payload.get("experience", []),
            projects=payload.get("projects", [])
        )
        db.add(profile)
    else:
        if "skills" in payload:
            profile.skills = payload["skills"]
        if "education" in payload:
            profile.education = payload["education"]
        if "experience" in payload:
            profile.experience = payload["experience"]
        if "projects" in payload:
            profile.projects = payload["projects"]
            
    db.commit()
    db.refresh(profile)
    return serialize_profile(current_user, profile)

@router.post("/profile/migrate")
async def migrate_guest_profile(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    guest_user_id = payload.get("guest_user_id")
    if not guest_user_id:
        raise HTTPException(status_code=400, detail="Missing guest_user_id")
        
    guest_profile = db.query(Profile).filter(Profile.user_id == guest_user_id).first()
    if not guest_profile:
        return {"message": "No guest profile found to migrate"}
        
    # Copy profile data
    db_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not db_profile:
        db_profile = Profile(
            user_id=current_user.id,
            skills=guest_profile.skills,
            education=guest_profile.education,
            experience=guest_profile.experience,
            projects=guest_profile.projects,
            saved_internships=guest_profile.saved_internships
        )
        db.add(db_profile)
    else:
        db_profile.skills = guest_profile.skills
        db_profile.education = guest_profile.education
        db_profile.experience = guest_profile.experience
        db_profile.projects = guest_profile.projects
        if guest_profile.saved_internships:
            db_profile.saved_internships = guest_profile.saved_internships
            
    # Copy matches
    db.query(Match).filter(Match.user_id == current_user.id).delete()
    guest_matches = db.query(Match).filter(Match.user_id == guest_user_id).all()
    for gm in guest_matches:
        db_match = Match(
            user_id=current_user.id,
            job_id=gm.job_id,
            score=gm.score,
            matched_skills=gm.matched_skills,
            missing_skills=gm.missing_skills
        )
        db.add(db_match)
        
    # Clean up guest records
    db.query(Match).filter(Match.user_id == guest_user_id).delete()
    db.query(Profile).filter(Profile.user_id == guest_user_id).delete()
    db.query(User).filter(User.id == guest_user_id).delete()
    
    db.commit()
    return {"message": "Profile and matches migrated successfully"}

@router.get("/profile/saved")
async def get_saved_internships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile or not profile.saved_internships:
        return []
        
    jobs = db.query(Job).filter(Job.id.in_(profile.saved_internships)).all()
    return [
        {
            "id": j.id,
            "job_title": j.title,
            "company": j.company,
            "location": j.location,
            "stipend": j.stipend,
            "duration": j.duration,
            "url": j.url,
            "source": j.source,
            "required_skills": j.skills
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
    if job_id is None:
        raise HTTPException(status_code=400, detail="Missing job_id")
        
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Upload a resume first.")
        
    saved = list(profile.saved_internships or [])
    if job_id not in saved:
        saved.append(job_id)
        profile.saved_internships = saved
        db.commit()
        
    return {"message": "Job saved successfully", "saved_internships": saved}

@router.delete("/profile/saved/{job_id}")
async def unsave_internship(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    saved = list(profile.saved_internships or [])
    if job_id in saved:
        saved.remove(job_id)
        profile.saved_internships = saved
        db.commit()
        
    return {"message": "Job unsaved successfully", "saved_internships": saved}
