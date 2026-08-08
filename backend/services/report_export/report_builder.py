import datetime
from sqlalchemy.orm import Session
from config.models import User, Profile, Match, Job

def build_report_data(user: User, db: Session) -> dict:
    profile = user.profile
    # Fetch all matches for the user
    matches = db.query(Match).filter(Match.user_id == user.id).order_by(Match.score.desc()).all()
    
    candidate_name = user.username or (user.email.split("@")[0] if user.email else "Not Available")
    generated_date = datetime.datetime.now().strftime("%d %B %Y")
    
    total_matches = len(matches)
    avg_score = int(sum(m.score or 0 for m in matches) / total_matches) if total_matches > 0 else 0
    top_score = int(matches[0].score or 0) if total_matches > 0 else 0
    
    # Extract top 5 matches
    top_5_matches = []
    all_matched_skills = {}
    all_skill_gaps = {}
    
    for i, match in enumerate(matches):
        if i < 5:
            job = match.job
            top_5_matches.append({
                "job_title": job.title or "Unknown Role",
                "company": job.company or "Unknown Company",
                "score": int(match.score) if match.score else 0,
                "url": job.url or "Not Available"
            })
            
        # Aggregate skills for summary
        for s in (match.matched_skills or []):
            all_matched_skills[s] = all_matched_skills.get(s, 0) + 1
        for s in (match.missing_skills or []):
            all_skill_gaps[s] = all_skill_gaps.get(s, 0) + 1
            
    # Sort aggregated skills by frequency
    sorted_matched = sorted(all_matched_skills.items(), key=lambda x: x[1], reverse=True)
    sorted_gaps = sorted(all_skill_gaps.items(), key=lambda x: x[1], reverse=True)
    
    matched_skills = [k for k, v in sorted_matched[:8]]
    skill_gaps = [k for k, v in sorted_gaps[:8]]
    
    data = {
        "candidate_name": candidate_name,
        "generated_date": generated_date,
        "task_id": "HAI-DASH",
        "status": "Completed",
        "total_matches": total_matches,
        "avg_score": avg_score,
        "top_score": top_score,
        "top_5_matches": top_5_matches,
        "matched_skills": matched_skills,
        "skill_gaps": skill_gaps,
    }
    
    return data
