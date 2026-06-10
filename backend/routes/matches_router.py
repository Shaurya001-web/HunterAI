from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import urllib.parse
from engine.matching_engine import rank_jobs
from scrapers.internshala_scraper import scrape_internshala
from routes.auth import get_current_user
from config.models import User, Profile, Job, Match
from config.database import get_db

router = APIRouter()

def generate_platform_jobs(keyword: str) -> list:
    if not keyword:
        return []
    
    kw = keyword.strip()
    kw_cap = kw.capitalize()
    
    # Generate matching skills based on typical domains
    skills_map = {
        "machine learning": ["Python", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "SQL", "NLP"],
        "data science": ["Python", "SQL", "Pandas", "NumPy", "Tableau", "Machine Learning", "Statistics"],
        "python": ["Python", "FastAPI", "Django", "Flask", "SQL", "Git"],
        "web development": ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "HTML", "CSS", "Tailwind"],
        "software engineering": ["Java", "C++", "Python", "Data Structures", "Algorithms", "Git", "Docker"]
    }
    
    # Default skills if keyword not in mapping
    req_skills = skills_map.get(kw.lower(), [kw_cap, "Python", "Git", "SQL"])
    
    linkedin_jobs = [
        {
            "job_title": f"{kw_cap} Intern",
            "company": "Google India",
            "location": "Bengaluru (Hybrid)",
            "stipend": "₹60,000 /month",
            "duration": "6 months",
            "required_skills": req_skills,
            "url": "https://www.linkedin.com/jobs/search/?keywords=" + urllib.parse.quote(kw),
            "source": "LinkedIn"
        },
        {
            "job_title": f"Junior {kw_cap} Engineer",
            "company": "Amazon",
            "location": "Hyderabad (On-site)",
            "stipend": "₹45,000 /month",
            "duration": "3 months",
            "required_skills": req_skills + ["AWS"],
            "url": "https://www.linkedin.com/jobs/search/?keywords=" + urllib.parse.quote(kw),
            "source": "LinkedIn"
        }
    ]
    
    wellfound_jobs = [
        {
            "job_title": f"AI & {kw_cap} Intern",
            "company": "NeuralStart.ai (YC)",
            "location": "Remote",
            "stipend": "$2,500 /month",
            "duration": "6 months",
            "required_skills": req_skills + ["LangChain", "LLMs"],
            "url": "https://wellfound.com/jobs",
            "source": "Wellfound"
        },
        {
            "job_title": f"{kw_cap} Developer",
            "company": "Codex Labs",
            "location": "San Francisco (Remote)",
            "stipend": "$3,000 /month",
            "duration": "4 months",
            "required_skills": req_skills + ["FastAPI", "Docker"],
            "url": "https://wellfound.com/jobs",
            "source": "Wellfound"
        }
    ]
    
    return linkedin_jobs + wellfound_jobs

@router.get("/matches")
def get_matches(
    keyword: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Fetch user profile from database
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=400, detail="No profile found. Please upload a resume first.")
        
        user_profile_dict = {
            "name": current_user.name or "",
            "email": current_user.email,
            "skills": profile.skills,
            "education": profile.education,
            "experience": profile.experience,
            "projects": profile.projects
        }

        # 2. Collect jobs (either scraping or querying existing)
        jobs_pool = []
        if keyword:
            scraped_jobs = []
            # Scrape Internshala
            try:
                scraped = scrape_internshala(keyword, limit=3)
                if scraped:
                    for s in scraped:
                        s["source"] = "Internshala"
                    scraped_jobs.extend(scraped)
            except Exception as e:
                print(f"On-demand Internshala scraping failed: {e}")
            
            # Synthesize platform jobs
            platform_jobs = generate_platform_jobs(keyword)
            scraped_jobs.extend(platform_jobs)
            
            # Save new jobs to database
            for sj in scraped_jobs:
                # Check for duplicate
                existing = db.query(Job).filter(
                    Job.title == sj["job_title"],
                    Job.company == sj["company"]
                ).first()
                
                if not existing:
                    new_job = Job(
                        title=sj["job_title"],
                        company=sj["company"],
                        skills=sj["required_skills"],
                        location=sj.get("location"),
                        stipend=sj.get("stipend"),
                        duration=sj.get("duration"),
                        url=sj.get("url"),
                        source=sj.get("source")
                    )
                    db.add(new_job)
            db.commit()
        
        # 3. Fetch all jobs from database to score against
        db_jobs = db.query(Job).all()
        
        # Map database jobs back to engine representation
        engine_jobs = []
        job_map = {} # Store DB job objects by key to save matches later
        for dj in db_jobs:
            job_key = (dj.title, dj.company)
            job_map[job_key] = dj
            
            engine_jobs.append({
                "job_title": dj.title,
                "company": dj.company,
                "stipend": dj.stipend,
                "location": dj.location,
                "duration": dj.duration,
                "required_skills": dj.skills,
                "url": dj.url,
                "source": dj.source
            })
            
        if not engine_jobs:
            return []
            
        # 4. Score and Rank using the matching engine
        ranked_matches = rank_jobs(user_profile_dict, engine_jobs, keyword)
        
        # 5. Persist calculated matches in database for user
        # Clean old matches for this user first to keep matches list updated
        db.query(Match).filter(Match.user_id == current_user.id).delete()
        
        for rm in ranked_matches:
            job_obj = job_map.get((rm["job_title"], rm["company"]))
            if job_obj:
                rm["id"] = job_obj.id
                db_match = Match(
                    user_id=current_user.id,
                    job_id=job_obj.id,
                    score=rm["score"],
                    matched_skills=rm["matched_skills"],
                    missing_skills=rm["missing_skills"]
                )
                db.add(db_match)
        db.commit()
        
        return ranked_matches
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error calculating matches: {e}")
