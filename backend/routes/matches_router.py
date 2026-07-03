from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from engine.matching_engine import rank_jobs
from scrapers.internshala_scraper import scrape_internshala
from routes.auth import get_current_user
from config.models import User, Profile, Job, Match
from config.database import get_db

router = APIRouter()

@router.get("/matches")
def get_matches(
    keyword: str | None = None,
    location: str | None = None,
    remote_only: bool = False,
    stipend_min: int | None = None,
    duration_max: int | None = None,
    email: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Fetch user profile from database
        profile = None
        target_user = current_user
        if email:
            target_user_db = db.query(User).filter(User.email == email).first()
            if target_user_db:
                target_user = target_user_db
                profile = db.query(Profile).filter(Profile.user_id == target_user.id).first()
        
        if not profile:
            profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
            target_user = current_user

        if not profile:
            raise HTTPException(status_code=400, detail="No profile found. Please upload a resume first.")
        
        user_profile_dict = {
            "name": target_user.name or "",
            "email": target_user.email,
            "skills": profile.skills,
            "education": profile.education,
            "experience": profile.experience,
            "projects": profile.projects
        }

        # 2. Collect jobs (either scraping or querying existing)
        scrape_keyword = keyword
        
        # If no keyword was searched, but the database is empty, auto-scrape using their top skill
        # so they don't see an empty page on first login.
        if not scrape_keyword and db.query(Job).count() < 10 and profile.skills:
            scrape_keyword = profile.skills[0]

        if scrape_keyword:
            scraped_jobs = []
            # Scrape Internshala
            try:
                scraped = scrape_internshala(scrape_keyword, limit=25)
                if scraped:
                    for s in scraped:
                        s["source"] = "Internshala"
                    scraped_jobs.extend(scraped)
            except Exception as e:
                print(f"On-demand Internshala scraping failed: {e}")
            
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
                        source=sj.get("source"),
                        is_remote=sj.get("is_remote", False),
                        stipend_min=sj.get("stipend_min", 0),
                        duration_months=sj.get("duration_months", 0),
                        constraints=sj.get("constraints", {})
                    )
                    db.add(new_job)
            db.commit()
        
        # 3. Hybrid Filtering - Phase 1: Cheap SQL Filtering
        query = db.query(Job)
        
        if remote_only:
            query = query.filter(Job.is_remote == True)
        elif location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
            
        if stipend_min:
            query = query.filter(Job.stipend_min >= stipend_min)
            
        if duration_max:
            query = query.filter(Job.duration_months > 0, Job.duration_months <= duration_max)
            
        db_jobs = query.all()
        
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
                "source": dj.source,
                "constraints": dj.constraints
            })
            
        if not engine_jobs:
            return []
            
        # 4. Score and Rank using the matching engine
        ranked_matches = rank_jobs(user_profile_dict, engine_jobs, keyword)
        
        # 5. Persist calculated matches in database for user
        # Clean old matches for this user first to keep matches list updated
        db.query(Match).filter(Match.user_id == target_user.id).delete()
        
        for rm in ranked_matches:
            job_obj = job_map.get((rm["job_title"], rm["company"]))
            if job_obj:
                rm["id"] = job_obj.id
                db_match = Match(
                    user_id=target_user.id,
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
