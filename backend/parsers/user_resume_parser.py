from langchain.chat_models import init_chat_model
import os,json,fitz,asyncio
from dotenv import load_dotenv
from pydantic import BaseModel

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)

dotenv_path = os.path.join(project_root, "config", ".env")
load_dotenv(dotenv_path)

class UserProfile(BaseModel):
    name: str
    email: str
    phone: str
    skills: list[str]
    projects: list
    education: list
    experience: list

# LLM initialization is moved inside parse_resume_to_json to make it lazy-loaded.


def extract_text(pdf_path: str) -> str:
    with fitz.open(pdf_path) as Content:
        text=""
        for text_pdf in Content:
            text+=text_pdf.get_text()
        return text

async def parse_resume_to_json(pdf_path: str) -> dict:
    text = extract_text(pdf_path)
    prompt_text = f"""
You are an expert ATS resume parser. Your job is to extract candidate information and output a clean, strict JSON file adhering strictly to the schema rules below.

Rules:
1. **Name, Email, Phone**: Parse accurately.
2. **Skills Extraction Rules (CRITICAL)**:
   - ONLY extract skills that are explicitly listed in the dedicated "SKILLS" section of the resume, or are clearly demonstrated by technologies listed inside the candidate's "PROJECTS" / "EXPERIENCE" sections.
   - **DO NOT** extract skills from the "CAREER OBJECTIVE", "PROFESSIONAL SUMMARY", "FUTURE GOALS", or "HOBBIES" statements. For example, if the candidate states they are "Seeking an internship to apply machine learning and Generative AI", do NOT add "Machine Learning" or "Generative AI" to their skills array unless they have a matching project, certification, or technical skill entry proving they have actual hands-on capability.
   - Separate and extract standalone skills (e.g. "C++", "Java", "HTML", "CSS", "Git", "GitHub") cleanly.
3. **Projects**: For each project, extract the exact title, description details, and technical tools used. Make sure you map them to the keys:
   - "title": (Project name)
   - "description": (Project description)
   - "technologies": (List of tools/technologies used)
4. **Education**: Parse the institution, degree/course name, and years/passing details.
5. **Experience**: Parse the company, role, duration, and details.

JSON Schema format to follow:
{{
  "name": "Candidate's full name",
  "email": "Candidate's email",
  "phone": "Candidate's phone number",
  "skills": ["Skill 1", "Skill 2", ...],
  "projects": [
     {{
       "title": "Project Title",
       "description": "Project details description",
       "technologies": ["Tool 1", "Tool 2", ...]
     }}
  ],
  "education": [
     {{
       "institution": "University/School",
       "degree": "Degree earned",
       "year": "Dates of study"
     }}
  ],
  "experience": [
     {{
       "company": "Company Name",
       "role": "Job Title",
       "duration": "Dates of employment",
       "description": "Job description details"
     }}
  ]
}}

Resume Text:
{text}
"""
    json_text = ""
    try:
        # Try primary Gemini model
        llm_model = init_chat_model(model="google_genai:gemini-2.5-flash")
        res = await asyncio.wait_for(llm_model.ainvoke(prompt_text), timeout=15.0)
        json_text = res.content
    except Exception as gemini_err:
        print(f"Gemini API invocation failed or timed out: {gemini_err}. Attempting Groq fallback...")
        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            print("GROQ_API_KEY environment variable is not set. Raising Gemini exception.")
            raise gemini_err
        
        import httpx
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "user",
                    "content": prompt_text
                }
            ],
            "response_format": {"type": "json_object"}
        }
        
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                groq_res = response.json()
                json_text = groq_res["choices"][0]["message"]["content"]
                print("Successfully parsed resume using Groq fallback!")
        except Exception as groq_err:
            print(f"Groq API fallback also failed: {groq_err}")
            raise gemini_err

    if json_text:
        # Clean up possible markdown code fences
        cleaned_json = json_text.strip()
        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json[7:]
        elif cleaned_json.startswith("```"):
            cleaned_json = cleaned_json[3:]
        if cleaned_json.endswith("```"):
            cleaned_json = cleaned_json[:-3]
        cleaned_json = cleaned_json.strip()

        data = json.loads(cleaned_json)
        return data
    raise ValueError("No response from LLM model")

def get_default_resume_path():
    return os.path.join(project_root, "data", "uploads", "resume", "25bai70051_shauryamishra.pdf")

def content_file():
    path = get_default_resume_path()
    return extract_text(path)

async def response():
    path = get_default_resume_path()
    if not os.path.exists(path):
        print(f"Test resume file not found at: {path}")
        return {}
    data = await parse_resume_to_json(path)
    print("\nProfile saved successfully ✅")
    return data

if __name__ == "__main__":
    asyncio.run(response())


