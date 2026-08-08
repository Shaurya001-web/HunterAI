"""Build reports from persisted Hunter AI data only; this module never calls AI or scoring."""
from collections import Counter
from datetime import datetime, timezone
from typing import Any

from config.models import Job, Match, Profile, TailoredResume, User
from .schemas import CareerReport, ReportSection


def _value_or_unavailable(value: Any) -> Any:
    return value if value not in (None, "", [], {}) else "Not Available"


def _completion(profile: Profile | None) -> int:
    if not profile:
        return 0
    return min(100, (35 if profile.skills else 0) + (30 if profile.projects else 0) +
               (25 if profile.experience else 0) + 10)


def _format_resume_summary(profile: Profile | None) -> dict[str, Any]:
    if not profile:
        return {"status": "Not Available"}
    return {
        "skills": profile.skills or [],
        "education": profile.education or [],
        "experience": profile.experience or [],
        "projects": profile.projects or [],
    }


def build_report(user: User, db) -> CareerReport:
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    matches = db.query(Match).filter(Match.user_id == user.id).order_by(Match.score.desc()).all()
    tailored = db.query(TailoredResume).filter(TailoredResume.user_id == user.id).order_by(TailoredResume.created_at.desc()).all()

    missing = Counter(skill for match in matches for skill in (match.missing_skills or []) if skill)
    jobs = [{
        "title": match.job.title, "company": match.job.company, "score": round(match.score),
        "location": match.job.location or "Not Available", "matched_skills": match.matched_skills or [],
        "missing_skills": match.missing_skills or [], "source": match.job.source or "Not Available",
    } for match in matches if match.job]
    best_score = round(matches[0].score) if matches else "Not Available"
    latest_tailor = tailored[0] if tailored else None
    saved_jobs = []
    if profile and profile.saved_internships:
        saved_jobs = db.query(Job).filter(Job.id.in_(profile.saved_internships)).all()

    sections = [
        ReportSection("Resume Summary", _format_resume_summary(profile)),
        ReportSection("ATS Score", best_score),
        ReportSection("ATS Breakdown", {"top_match_score": best_score, "matched_opportunities": len(matches)} if matches else "Not Available"),
        ReportSection("Strengths", list(profile.skills or []) if profile else "Not Available"),
        ReportSection("Weaknesses", list(missing.keys()) or "Not Available"),
        ReportSection("Skill Analysis", {"parsed_skills": profile.skills or []} if profile else "Not Available"),
        ReportSection("Missing Skills", list(missing.keys()) or "Not Available"),
        ReportSection("Resume Improvement Suggestions", "Not Available"),
        ReportSection("Resume Tailoring Suggestions", latest_tailor.tailored_json if latest_tailor else "Not Available"),
        ReportSection("Top Recommended Jobs", jobs or "Not Available"),
        ReportSection("Career Growth Suggestions", "Not Available"),
        ReportSection("Market Intelligence", "Not Available"),
        ReportSection("Recent Activity", {
            "saved_jobs": [{"title": job.title, "company": job.company} for job in saved_jobs],
            "tailored_resumes_generated": len(tailored),
        } if saved_jobs or tailored else "Not Available"),
        ReportSection("Overall AI Summary", "Not Available"),
    ]
    return CareerReport(
        candidate_name=user.username or user.email.split("@")[0], candidate_email=user.email,
        generated_at=datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC"),
        profile_completion=_completion(profile),
        resume_parsing_status="Complete" if profile else "Not Available", sections=sections,
    )

