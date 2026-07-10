from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from routes.auth import get_current_user
from config.models import User
from config.database import get_db

router = APIRouter()

def serialize_user_profile(user: User):
    return {
        "user_id": user.id,
        "username": user.username or "",
        "email": user.email,
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
