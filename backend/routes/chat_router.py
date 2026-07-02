from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
import json
from google import genai
from google.genai import types

from routes.auth import get_current_user
from config.models import User, Profile
from config.database import get_db

router = APIRouter()

import os

# Get Gemini API Key from environment
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# Define Pydantic BaseModel for structured response
class ActionItem(BaseModel):
    category: str = Field(description="The category of the action item (e.g., 'Skills', 'Experience', 'Formatting')")
    suggestion: str = Field(description="A specific, actionable suggestion for improvement")

class ResumeInsights(BaseModel):
    overall_score: int = Field(description="An estimated score out of 100 based on the resume quality")
    strengths: List[str] = Field(description="A list of 3-5 key strengths of the resume")
    weaknesses: List[str] = Field(description="A list of areas that need improvement")
    action_items: List[ActionItem] = Field(description="Actionable steps the user can take to improve their resume")
    response_message: str = Field(description="A conversational response to the user's specific query")

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_gemini(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please upload a resume first.")

    # Construct the context
    resume_context = f"""
    User Name: {current_user.name}
    Skills: {', '.join(profile.skills) if profile.skills else 'None listed'}
    Education: {profile.education}
    Experience: {profile.experience}
    Projects: {profile.projects}
    """

    system_prompt = f"""
    You are an expert career counselor and technical recruiter.
    The user is asking for insights on their resume and what changes need to be made.
    Here is their parsed resume data:
    {resume_context}
    
    The user's query is: "{request.message}"
    
    Analyze their resume carefully and provide a highly structured analysis directly answering their query.
    Always be encouraging but professionally honest about what is missing.
    """

    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured on the server.")

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=system_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeInsights,
                temperature=0.7,
            ),
        )
        # Parse the JSON string response back to a dict so FastAPI can serialize it
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
