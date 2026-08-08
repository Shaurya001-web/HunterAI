import datetime
from sqlalchemy.orm import Session
from config.models import User, Profile, Match, Job

def build_report_data(user: User, db: Session) -> dict:
    profile = user.profile
    # Get the best match if available
    best_match = db.query(Match).filter(Match.user_id == user.id).order_by(Match.score.desc()).first()
    
    candidate_name = user.username or (user.email.split("@")[0] if user.email else "Not Available")
    generated_date = datetime.datetime.now().strftime("%d %B %Y")
    
    data = {
        "candidate_name": candidate_name,
        "target_role": "Not Available",
        "generated_date": generated_date,
        "task_id": "HAI-001",
        "status": "Completed",
        "job_title": "Not Available",
        "company": "Not Available",
        "location": "Not Available",
        "experience_required": "Not Available",
        "job_source": "Not Available",
        "job_link": "Not Available",
        "overall_score": "Not Available",
        "resume_score": "Not Available",
        "skills_score": "Not Available",
        "experience_score": "Not Available",
        "education_score": "Not Available",
        "matched_skills": [],
        "skill_gaps": [],
        "recommendations": [],
        "agent_notes": "Not Available"
    }

    if best_match:
        job = best_match.job
        data["target_role"] = job.title or "Not Available"
        data["job_title"] = job.title or "Not Available"
        data["company"] = job.company or "Not Available"
        data["location"] = job.location or "Not Available"
        data["experience_required"] = job.duration or "Not Available"
        data["job_source"] = job.source or "Hunter AI"
        data["job_link"] = job.url or "Not Available"
        
        data["overall_score"] = int(best_match.score) if best_match.score is not None else "Not Available"
        data["matched_skills"] = best_match.matched_skills or []
        data["skill_gaps"] = best_match.missing_skills or []
        
        recs = []
        for i, skill in enumerate(data["skill_gaps"][:4]):
            if i == 0:
                recs.append(f"Learn {skill} fundamentals.")
            elif i == 1:
                recs.append(f"Improve {skill} knowledge.")
            elif i == 2:
                recs.append(f"Add a deployed project using {skill}.")
            else:
                recs.append(f"Mention {skill} experience more clearly in the resume.")
        data["recommendations"] = recs if recs else ["Profile looks strong for this role."]

        if hasattr(best_match, "suitability_assessment") and best_match.suitability_assessment:
            data["agent_notes"] = best_match.suitability_assessment
        else:
            if len(data["skill_gaps"]) > 0:
                data["agent_notes"] = f"The candidate has a strong foundation but lacks experience in {', '.join(data['skill_gaps'][:2])}."
            else:
                data["agent_notes"] = "The candidate is a strong fit for this role."

    return data
