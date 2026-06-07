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

llm_model=init_chat_model(model="google_genai:gemini-2.5-flash")

resume_path = os.path.join(project_root, "data", "uploads", "resume", "25bai70051_shauryamishra.pdf")

def extract_text(pdf_path: str) -> str:
    with fitz.open(pdf_path) as Content:
        text=""
        for text_pdf in Content:
            text+=text_pdf.get_text()
        return text

async def parse_resume_to_json(pdf_path: str) -> dict:
    text = extract_text(pdf_path)
    prompt_text = f"""
You are an ATS resume parser.

Extract information from the resume and return ONLY valid JSON.

Rules:
- Do not add explanations.
- Do not add markdown.
- Do not invent information.
- Remove duplicate skills.
- Use [] for missing lists.
- Use "" for missing strings.
Schema:
{{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "projects": [],
  "education": [],
  "experience": []
}}
Resume Text:
{text}
"""
    json_text = ""
    try:
        # Try primary Gemini model
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

def content_file():
    return extract_text(resume_path)

async def response():
    data = await parse_resume_to_json(resume_path)
    print("\nProfile saved successfully ✅")
    return data

if __name__ == "__main__":
    asyncio.run(response())

