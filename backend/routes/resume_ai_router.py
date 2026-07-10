import os
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Literal
from routes.auth import get_current_user

# Attempt to load google-genai
try:
    from google import genai
    from google.genai import types
    has_genai = True
except ImportError:
    has_genai = False

router = APIRouter(prefix="/resume-ai", tags=["Resume AI"])

# --- Request Models ---

class GenerateResumeRequest(BaseModel):
    target_role: Optional[str] = None
    raw_experience: str
    raw_projects: str
    raw_education: str
    known_skills: List[str] = []

class ImproveSectionRequest(BaseModel):
    section_type: Literal['summary', 'experience', 'project', 'headline']
    current_text: str
    context: Optional[dict] = None

class ImproveSectionResponse(BaseModel):
    suggestions: List[str]

# --- Output Schema for Bulk Generate ---

class ExperienceItem(BaseModel):
    role: str
    company: str
    duration: str
    description: Optional[str] = None

class EducationItem(BaseModel):
    institution: str
    degree: str
    year: str

class ProjectItem(BaseModel):
    name: str
    techStack: Optional[List[str]] = None
    description: Optional[str] = None

class ResumeDataSchema(BaseModel):
    firstName: str
    lastName: str
    headline: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = []
    education: Optional[List[EducationItem]] = []
    skills: Optional[List[str]] = []
    projects: Optional[List[ProjectItem]] = []
    certifications: Optional[List[str]] = []
    achievements: Optional[List[str]] = []


def get_genai_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not has_genai:
        raise HTTPException(status_code=500, detail="Gemini API is not configured or google-genai is missing.")
    return genai.Client(api_key=api_key)

@router.post("/generate")
async def generate_resume_draft(req: GenerateResumeRequest, current_user=Depends(get_current_user)):
    client = get_genai_client()
    
    prompt = f"""
You are an expert resume writer. Turn the following raw notes into a fully structured professional resume draft.
Target Role: {req.target_role or 'Not specified'}

RAW EXPERIENCE:
{req.raw_experience}

RAW PROJECTS:
{req.raw_projects}

RAW EDUCATION:
{req.raw_education}

KNOWN SKILLS:
{', '.join(req.known_skills) if req.known_skills else 'None provided'}

INSTRUCTIONS:
1. Turn the raw experience and projects into properly written resume bullet points (use action verbs + quantified impact where possible).
2. Infer a strong, professional 'summary' based on the target role and provided background.
3. Infer a professional 'headline'.
4. Keep it truthful. Do NOT invent companies, dates, degrees, or metrics that are not present in or reasonably inferred from the input.
5. If the user provided partial name/contact info in the notes, use it for firstName, lastName, email, etc. Otherwise leave them blank or generic (e.g. 'Jane', 'Doe').
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ResumeDataSchema,
                temperature=0.7,
            ),
        )
        if not response.text:
            raise ValueError("Empty response from Gemini")
        
        # The response text should be valid JSON matching the schema
        result_dict = json.loads(response.text)
        return result_dict
    except Exception as e:
        print("Generate error:", e)
        raise HTTPException(status_code=500, detail=str(e))

class SuggestionsSchema(BaseModel):
    suggestions: List[str]

@router.post("/improve-section", response_model=ImproveSectionResponse)
async def improve_section(req: ImproveSectionRequest, current_user=Depends(get_current_user)):
    client = get_genai_client()
    
    context_str = ""
    if req.context:
        context_str = "\\nCONTEXT:\\n" + "\\n".join([f"{k}: {v}" for k, v in req.context.items()])

    prompt = f"""
You are an expert resume reviewer. Please rewrite the following {req.section_type} text to be more impactful, concise, and professional. 
Provide 3 different variations of the rewrite so the user has options.

CURRENT TEXT:
{req.current_text}
{context_str}

Ensure the rewrites are truthful but use strong action verbs.
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SuggestionsSchema,
                temperature=0.8,
            ),
        )
        if not response.text:
            raise ValueError("Empty response from Gemini")
            
        result_dict = json.loads(response.text)
        return {"suggestions": result_dict.get("suggestions", [])}
    except Exception as e:
        print("Improve error:", e)
        raise HTTPException(status_code=500, detail=str(e))
