from typing import Union, Dict, Any
from ats.extractor import extract_resume_text
from ats.prompt import build_ats_prompt
from ats.llm import ask_llm, ask_llm_async
from ats.parser import parse_ats_json
from ats.scorer import format_ats_result
def calculate_ats_score(resume_file: Union[str, bytes], job_description: str = "") -> Dict[str, Any]:
    """
    Main synchronous ATS evaluation pipeline.
    Connects: Extractor -> Prompt -> LLM -> Parser -> Scorer.
    """
    text = extract_resume_text(resume_file)
    if not text:
        text = "No resume text could be extracted."
    prompt = build_ats_prompt(text, job_description)
    ai_response = ask_llm(prompt)
    parsed = parse_ats_json(ai_response)
    result = format_ats_result(parsed)
    return result
async def calculate_ats_score_async(resume_file:Union[str, bytes], job_description: str = "") -> Dict[str, Any]:
    """
    Main asynchronous ATS evaluation pipeline.
    """
    text = extract_resume_text(resume_file)
    if not text:
        text = "No resume text could be extracted."
    prompt = build_ats_prompt(text, job_description)
    ai_response = await ask_llm_async(prompt)
    parsed = parse_ats_json(ai_response)
    result = format_ats_result(parsed)
    return result
