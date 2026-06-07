from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from routes.auth import get_current_user
from config.models import User, Profile
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
        "projects": profile.projects if profile else []
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
