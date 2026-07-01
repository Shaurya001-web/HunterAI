import os
import json
from typing import List, Dict, Any, Set

def load_profiles(file_path: str) -> List[Dict[str, Any]]:
    """
    Loads user profiles from a JSON file.
    
    Args:
        file_path: Absolute or relative path to the user profiles JSON file.
        
    Returns:
        A list of dictionaries representing user profiles.
    """
    if not os.path.exists(file_path):
        print(f"Warning: Profiles file not found at {file_path}. Returning empty list.")
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            return []
    except Exception as e:
        print(f"Error loading profiles from {file_path}: {e}")
        return []

def load_jobs(file_path: str) -> List[Dict[str, Any]]:
    """
    Loads jobs from a JSON file.
    
    Args:
        file_path: Absolute or relative path to the jobs JSON file.
        
    Returns:
        A list of dictionaries representing jobs.
    """
    if not os.path.exists(file_path):
        print(f"Warning: Jobs file not found at {file_path}. Returning empty list.")
        return []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return [data]
            return []
    except Exception as e:
        print(f"Error loading jobs from {file_path}: {e}")
        return []

# Simple keyword mappings to catch related terms
KEYWORDS_MAP = {
    "machine learning": ["ml", "machine learning", "deep learning", "neural", "tensorflow", "pytorch", "scikit", "ai", "artificial intelligence", "regression", "model", "nlp", "cnn", "rnn", "computer vision", "llm", "chatgpt", "claude"],
    "data science": ["data science", "pandas", "numpy", "matplotlib", "seaborn", "scikit", "analysis", "analytics", "sql", "machine learning", "ml"],
    "python": ["python", "django", "flask", "fastapi", "pytest", "numpy", "pandas"],
    "web development": ["react", "next.js", "angular", "vue", "node", "express", "html", "css", "js", "javascript", "typescript", "web", "website", "django", "flask"],
    "software engineering": ["java", "c++", "c#", "python", "go", "rust", "algorithm", "data structures", "system design", "docker", "kubernetes", "git"]
}

import re

def _is_skill_match(user_skill: str, term: str) -> bool:
    if term == user_skill:
        return True
    # If the term is very short (like rest, api, git, ml, nlp), use word boundaries
    if len(term) <= 4 or len(user_skill) <= 4:
        pattern = r'\b' + re.escape(term) + r'\b'
        return bool(re.search(pattern, user_skill))
    return term in user_skill or user_skill in term

def calculate_match(user_skills: List[str], job_skills: List[str]) -> Dict[str, Any]:
    """
    Compares user skills against job required skills, and calculates the match score,
    matched skills, and missing skills. Uses substring and synonymous matching.
    """
    if not job_skills:
        return {
            "match_score": 0.0,
            "matched_skills": [],
            "missing_skills": []
        }
    
    normalized_user_skills: List[str] = [skill.strip().lower() for skill in user_skills if skill]
    
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    
    for req_skill in job_skills:
        if not req_skill:
            continue
        normalized_req = req_skill.strip().lower()
        
        # Build a list of valid terms to match for this required skill
        terms_to_match = [normalized_req]
        for key, synonyms in KEYWORDS_MAP.items():
            if normalized_req == key or normalized_req in synonyms:
                terms_to_match.extend(synonyms)
                terms_to_match.append(key)
                
        terms_to_match = list(set(terms_to_match))
        
        matched = False
        for user_skill in normalized_user_skills:
            # Check if any synonymous term is in the user skill, or if user skill is in synonymous term
            for term in terms_to_match:
                if _is_skill_match(user_skill, term):
                    # Prevent overly broad matches like "c" in "react"
                    if len(user_skill) <= 2 and user_skill != term:
                        continue
                    if len(term) <= 2 and term != user_skill:
                        continue
                    matched = True
                    break
            if matched:
                break
                
        if matched:
            matched_skills.append(req_skill)
        else:
            missing_skills.append(req_skill)
            
    num_matched = len(matched_skills)
    num_required = len(job_skills)
    
    match_score = round((num_matched / num_required) * 100, 2)
    
    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }

def calculate_selection_probability_penalty(user_profile: Dict[str, Any], job: Dict[str, Any], score: float, num_matched_projects: int) -> float:
    penalty = 0.0
    title = job.get("job_title", "").lower()
    
    # 1. Seniority Check: If the title contains "Senior", "Lead", "Manager", "Architect", or "Sr.",
    # and the candidate is a student (experience is empty/short), apply a heavy penalty.
    experience = user_profile.get("experience", [])
    is_student = len(experience) == 0 or any(
        "intern" in str(exp.get("role", "")).lower() or any(kw in str(exp.get("description", "")).lower() for kw in ["student", "study", "university", "college"])
        for exp in experience if isinstance(exp, dict)
    )
    
    education = user_profile.get("education", [])
    is_current_student = any(
        any(c.isdigit() for c in str(edu.get("year", ""))) and "202" in str(edu.get("year", ""))
        for edu in education if isinstance(edu, dict)
    )
    
    if (is_student or is_current_student) and any(sk in title for sk in ["senior", "lead", "manager", "architect", "sr.", "principal"]):
        penalty += 35.0
        
    # 2. Project Relevance Penalty:
    # If the job requires a skill, and they match it but have ZERO matching projects in the domain,
    # reduce the score. Having projects proves practical capability.
    if num_matched_projects == 0 and score > 0:
        specific_roles = ["machine learning", "ml", "ai", "data science", "react", "frontend", "flutter", "java", "python", "backend"]
        if any(r in title for r in specific_roles):
            penalty += 25.0
            
    # 3. Core Tech Mismatch Penalty:
    # If the job title explicitly names a technology (e.g. "React Intern", "Flutter Developer", "Java Developer"),
    # and the candidate does NOT have this technology in their skills list:
    skills_lower = [s.lower() for s in user_profile.get("skills", [])]
    core_techs = ["react", "flutter", "java", "python", "c++", "angular", "node", "android", "ios", "machine learning", "ml", "aws", "docker"]
    for tech in core_techs:
        if tech in title:
            # Check if this tech or a synonym is in skills
            has_tech = False
            for s in skills_lower:
                if tech in s or (tech == "ml" and "machine learning" in s) or (tech == "machine learning" and "ml" in s):
                    has_tech = True
                    break
            if not has_tech:
                penalty += 30.0
                
    final_score = max(0.0, score - penalty)
    return round(final_score, 2)

def evaluate_suitability(user_profile: Dict[str, Any], job: Dict[str, Any], keyword: str = None) -> Dict[str, Any]:
    """
    Evaluates candidate suitability for a job based on skills and resume projects matching.
    """
    user_skills = user_profile.get("skills", [])
    job_skills = job.get("required_skills", [])
    match_result = calculate_match(user_skills, job_skills)
    
    # Check projects for keyword / job title relevance
    query = (keyword or job.get("job_title") or "").strip().lower()
    projects = user_profile.get("projects", [])
    matched_projects = []
    
    # Get all search terms to check
    search_terms = [query]
    for key, synonyms in KEYWORDS_MAP.items():
        if key in query or any(syn in query for syn in [key] + synonyms):
            search_terms.extend(synonyms)
            
    # Clean and deduplicate search terms
    search_terms = list(set([t.lower() for t in search_terms if t]))
    
    for proj in projects:
        if isinstance(proj, str):
            proj = {"title": proj, "description": "", "technologies": []}
        elif not isinstance(proj, dict):
            continue
            
        # Check if project contains title, description, or tech matching
        proj_title = (
            proj.get("title")
            or proj.get("name")
            or proj.get("projectName")
            or proj.get("project_name")
            or proj.get("projectTitle")
            or proj.get("project_title")
            or proj.get("project")
            or ""
        )
        proj_title = str(proj_title).lower()
        
        raw_desc = (
            proj.get("description")
            or proj.get("desc")
            or proj.get("details")
            or proj.get("detail")
            or proj.get("summary")
            or proj.get("about")
            or proj.get("work")
            or ""
        )
        proj_desc = " ".join(raw_desc) if isinstance(raw_desc, list) else str(raw_desc)
        proj_desc = proj_desc.lower()
        
        raw_techs = (
            proj.get("technologies")
            or proj.get("tech")
            or proj.get("techs")
            or proj.get("techStack")
            or proj.get("tech_stack")
            or proj.get("stack")
            or proj.get("tools")
            or []
        )
        proj_techs = [str(t).lower() for t in raw_techs if t]
        
        is_relevant = False
        for term in search_terms:
            if term in proj_title or term in proj_desc or any(term in tech for tech in proj_techs):
                if len(term) <= 2 and term not in proj_techs: # strict for short terms
                    continue
                is_relevant = True
                break
        if is_relevant:
            proj_title_display = (
                proj.get("title")
                or proj.get("name")
                or proj.get("projectName")
                or proj.get("project_name")
                or proj.get("projectTitle")
                or proj.get("project_title")
                or proj.get("project")
                or "Unnamed Project"
            )
            matched_projects.append(proj_title_display)
            
    num_matched_projects = len(matched_projects)
    score = match_result["match_score"]
    
    # Calculate adjusted score reflecting selection probability
    score = calculate_selection_probability_penalty(user_profile, job, score, num_matched_projects)
    
    # Determine suitability level
    if score >= 60 and num_matched_projects >= 1:
        assessment = f"Highly Suited: You have {num_matched_projects} relevant project(s) ({', '.join(matched_projects[:2])}) and match {int(score)}% of required skills."
        suitability_level = "highly_suited"
    elif score >= 30:
        if num_matched_projects == 0:
            assessment = f"Partially Suited: You match {int(score)}% of skills, but have no projects in this domain. Build a project to boost your profile."
            suitability_level = "partially_suited"
        else:
            assessment = f"Partially Suited: You have {num_matched_projects} relevant project(s), but match only {int(score)}% of required skills."
            suitability_level = "partially_suited"
    else:
        assessment = "Not Suited: Your profile lacks matching core skills, domain projects, or experience level for this role."
        suitability_level = "not_suited"
        
    return {
        "score": score,
        "matched_skills": match_result["matched_skills"],
        "missing_skills": match_result["missing_skills"],
        "matched_projects": matched_projects,
        "suitability_assessment": assessment,
        "suitability_level": suitability_level
    }

def rank_jobs(user_profile: Dict[str, Any], jobs: List[Dict[str, Any]], keyword: str = None) -> List[Dict[str, Any]]:
    """
    Compares a single user profile against a list of jobs, calculates match scores,
    and returns the jobs sorted by score in descending order.
    """
    ranked_list: List[Dict[str, Any]] = []
    
    for job in jobs:
        suitability = evaluate_suitability(user_profile, job, keyword)
        
        ranked_list.append({
            "job_title": job.get("job_title", "Unknown Job"),
            "company": job.get("company", "Unknown Company"),
            "stipend": job.get("stipend", "Negotiable"),
            "location": job.get("location", "Remote"),
            "url": job.get("url", ""),
            "duration": job.get("duration", "Not specified"),
            "source": job.get("source", "Internshala"),
            "score": suitability["score"],
            "matched_skills": suitability["matched_skills"],
            "missing_skills": suitability["missing_skills"],
            "matched_projects": suitability["matched_projects"],
            "suitability_assessment": suitability["suitability_assessment"],
            "suitability_level": suitability["suitability_level"]
        })
        
    # Sort descending by match score
    ranked_list.sort(key=lambda x: x["score"], reverse=True)
    return ranked_list

# Demonstration and basic testing logic
if __name__ == "__main__":
    # Sample Test Data
    sample_user = {
        "name": "Shaurya Mishra",
        "skills": ["Python", "FastAPI", "LangChain"]
    }
    
    sample_jobs = [
        {
            "job_title": "Backend Intern",
            "required_skills": ["Python", "FastAPI", "SQL"]
        },
        {
            "job_title": "Python Intern",
            "required_skills": ["Python", "Django"]
        },
        {
            "job_title": "Data Intern",
            "required_skills": ["Python", "Pandas", "SQL", "Machine Learning"]
        }
    ]
    
    print("--- Testing calculate_match ---")
    match_res = calculate_match(sample_user["skills"], sample_jobs[0]["required_skills"])
    print(json.dumps(match_res, indent=4))
    
    print("\n--- Testing rank_jobs ---")
    ranked = rank_jobs(sample_user, sample_jobs)
    print(json.dumps(ranked, indent=4))
    
    # Try running on actual JSON files
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    profiles_path = os.path.join(project_root, "data", "user_profiles.json")
    jobs_path = os.path.join(project_root, "data", "jobs.json")
    
    if os.path.exists(profiles_path) and os.path.exists(jobs_path):
        print("\n--- Running End-to-End matching on JSON files ---")
        profiles = load_profiles(profiles_path)
        jobs = load_jobs(jobs_path)
        
        if profiles and jobs:
            user = profiles[0]
            print(f"Ranking jobs for user: {user.get('name', 'Unknown')}")
            real_ranked = rank_jobs(user, jobs)
            print(json.dumps(real_ranked, indent=4))
