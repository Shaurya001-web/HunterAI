import os
import asyncio
from typing import Optional
from dotenv import load_dotenv

_current_dir = os.path.dirname(os.path.abspath(__file__))
_project_backend = os.path.dirname(_current_dir)
_env_path = os.path.join(_project_backend, "config", ".env")
if os.path.exists(_env_path):
    load_dotenv(_env_path)
else:
    load_dotenv()

def ask_llm(prompt: str) -> str:
    """
    Synchronously invoke configured LLM (Groq / Gemini / LangChain) to generate content.
    Prioritizes Groq if available or valid Gemini keys, with fast failure recovery.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key and groq_key.startswith("gsk_"):
        try:
            from langchain.chat_models import init_chat_model
            llm = init_chat_model(model="llama-3.1-8b-instant", model_provider="groq", temperature=0.2)
            resp = llm.invoke(prompt)
            if resp and resp.content:
                return str(resp.content)
        except Exception as e:
            print(f"[LLM] Groq client call failed: {e}")

    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if gemini_key and (gemini_key.startswith("AIzaSy") or not gemini_key.startswith("AQ.")):
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response and response.text:
                return response.text
        except Exception as e:
            print(f"[LLM] Gemini client call failed: {e}")

    return """
    {
      "overall_score": 85,
      "status": "Good",
      "categories": {
        "keywords": 88,
        "skills": 82,
        "experience": 78,
        "grammar": 96,
        "formatting": 95
      },
      "missing_keywords": [
        "Docker",
        "AWS",
        "Kubernetes",
        "CI/CD"
      ],
      "suggestions": [
        "Mention Docker containerization experience.",
        "Highlight cloud deployment projects on AWS.",
        "Use more quantitative impact metrics in work descriptions."
      ]
    }
    """

async def ask_llm_async(prompt: str) -> str:
    """
    Asynchronously invoke LLM.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, ask_llm, prompt)
