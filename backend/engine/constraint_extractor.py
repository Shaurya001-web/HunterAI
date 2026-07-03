import os
import json
from pydantic import BaseModel, Field
from typing import Optional, List
from groq import Groq

# Get Groq API Key from environment
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

class JobConstraints(BaseModel):
    min_education: Optional[str] = Field(description="Minimum education required: 'bachelors', 'masters', 'phd', or 'none'", default="none")
    requires_phd: bool = Field(description="True if the job explicitly requires a PhD or Doctorate", default=False)
    work_mode: Optional[str] = Field(description="'onsite', 'remote', or 'hybrid'", default="onsite")
    location_city: Optional[str] = Field(description="The city where the job is located, if mentioned", default=None)
    stipend_min_val: Optional[int] = Field(description="The minimum numeric stipend amount per month, if specified", default=None)
    duration_months: Optional[int] = Field(description="The duration of the internship in months, if specified", default=None)
    dealbreakers: List[str] = Field(description="A list of hard constraints (e.g., 'Must be in 3rd year', 'Requires US Citizenship')", default=[])

def extract_job_constraints(job_title: str, company: str, location_str: str, stipend_str: str, description: str) -> dict:
    """
    Uses Groq to extract structured constraints from a job description.
    """
    if not client:
        print("Warning: GROQ_API_KEY not set. Returning default constraints.")
        return JobConstraints().model_dump()
        
    prompt = f"""
    You are an expert technical recruiter AI. Extract the hard constraints from the following job listing.
    
    You must output a strictly valid JSON object matching this schema:
    {json.dumps(JobConstraints.model_json_schema(), indent=2)}
    
    Job Title: {job_title}
    Company: {company}
    Location String: {location_str}
    Stipend String: {stipend_str}
    
    Description:
    {description}
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a JSON extractor. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0,
            max_tokens=1000
        )
        
        # Parse the JSON string response back to a dict
        content = response.choices[0].message.content
        if not content:
            content = "{}"
        return json.loads(content)
        
    except Exception as e:
        print(f"Error extracting constraints with Groq: {e}")
        return JobConstraints().model_dump()
