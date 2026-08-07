from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, cast, String
from engine.matching_engine import rank_jobs
from scrapers.internshala_scraper import scrape_internshala
from scrapers.naukri_scraper import scrape_naukri
from scrapers.linkedin_scraper import scrape_linkedin
from concurrent.futures import ThreadPoolExecutor
from routes.auth import get_current_user
from config.models import User, Profile, Job, Match
from config.database import get_db, SessionLocal

from typing import Optional

router = APIRouter()

def background_scrape_jobs(scrape_keyword: str):
    db = SessionLocal()
    try:
        scraped_jobs = []
        def fetch_source(source_fn, keyword, limit, source_name):
            try:
                results = source_fn(keyword, limit=limit)
                if results:
                    for r in results:
                        r["source"] = source_name
                return results or []
            except Exception as e:
                print(f"On-demand {source_name} scraping failed: {e}")
                return []

        # Concurrently scrape from all sources
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [
                executor.submit(fetch_source, scrape_internshala, scrape_keyword, 15, "Internshala"),
                executor.submit(fetch_source, scrape_naukri, scrape_keyword, 10, "Naukri"),
                executor.submit(fetch_source, scrape_linkedin, scrape_keyword, 10, "LinkedIn")
            ]
            for future in futures:
                scraped_jobs.extend(future.result())
        
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
    except Exception as e:
        db.rollback()
        print(f"Background scrape failed: {e}")
    finally:
        db.close()

@router.get("/matches")
def get_matches(
    background_tasks: BackgroundTasks,
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    remote_only: bool = False,
    stipend_min: Optional[int] = None,
    duration_max: Optional[int] = None,
    sources: Optional[str] = None,
    job_types: Optional[str] = None,
    email: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # P0-2 Fix: Ignore email parameter, always use current_user.id
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        target_user = current_user

        if not profile:
            raise HTTPException(status_code=400, detail="No profile found. Please upload a resume first.")
        
        user_profile_dict = {
            "name": target_user.username or "",
            "email": target_user.email,
            "skills": profile.skills,
            "education": profile.education,
            "experience": profile.experience,
            "projects": profile.projects
        }

        # 2. Trigger background scraping
        scrape_keyword = keyword
        if not scrape_keyword and profile.skills:
            top_skill = profile.skills[0]
            matching_jobs_count = db.query(Job).filter(cast(Job.skills, String).ilike(f"%{top_skill}%")).count()
            if matching_jobs_count < 10 or db.query(Job).filter(Job.source == "Naukri").count() < 3:
                scrape_keyword = top_skill
                
        if scrape_keyword:
            # P1-1 Fix: Do this asynchronously
            background_tasks.add_task(background_scrape_jobs, scrape_keyword)
        
        # 3. Hybrid Filtering - Phase 1: Cheap SQL Filtering
        query = db.query(Job)
        
        # P1-2 Fix: Actually use the keyword to filter!
        if keyword:
            safe_keyword = keyword.replace("%", "\\%").replace("_", "\\_")
            query = query.filter(or_(
                Job.title.ilike(f"%{safe_keyword}%"),
                cast(Job.skills, String).ilike(f"%{safe_keyword}%")
            ))
            
        if remote_only:
            query = query.filter(Job.is_remote == True)
        elif location:
            safe_loc = location.replace("%", "\\%").replace("_", "\\_")
            query = query.filter(Job.location.ilike(f"%{safe_loc}%"))
            
        if stipend_min:
            query = query.filter(Job.stipend_min >= stipend_min)
            
        if duration_max:
            query = query.filter(Job.duration_months > 0, Job.duration_months <= duration_max)
            
        if sources:
            source_list = [s.strip() for s in sources.split(",") if s.strip()]
            if source_list:
                query = query.filter(Job.source.in_(source_list))
                
        if job_types:
            type_list = [t.strip().lower() for t in job_types.split(",") if t.strip()]
            if type_list:
                conditions = []
                if "internship" in type_list:
                    conditions.append(Job.title.ilike("%intern%"))
                if "full time" in type_list:
                    conditions.append(Job.title.ilike("%full time%"))
                    conditions.append(Job.title.ilike("%developer%"))
                    conditions.append(Job.title.ilike("%engineer%"))
                if "part time" in type_list:
                    conditions.append(Job.title.ilike("%part time%"))
                
                if conditions:
                    query = query.filter(or_(*conditions))
            
        db_jobs = query.order_by(Job.id.desc()).limit(200).all()
        
        # Map database jobs back to engine representation
        engine_jobs = []
        for dj in db_jobs:
            engine_jobs.append({
                "id": dj.id,
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
        
        # P1-8 Fix: Stop destructive Match writes. Do not delete and recreate.
        
        return ranked_matches
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error calculating matches: {e}")

@router.get("/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "job_title": job.title,
        "company": job.company,
        "required_skills": job.skills,
        "location": job.location,
        "stipend": job.stipend,
        "duration": job.duration,
        "url": job.url
    }
