import os
import json
from scrapers.internshala_scraper import scrape_internshala
from engine.matching_engine import load_profiles, rank_jobs

def main():
    print("=====================================================")
    print("🎯 Welcome to Internship Hunter Matching Engine! 🎯")
    print("=====================================================\n")
    
    # Resolve directory paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    profiles_path = os.path.join(current_dir, "data", "user_profiles.json")
    
    # 1. Load User Profile
    if not os.path.exists(profiles_path):
        print(f"❌ Error: User profiles file not found at: {profiles_path}")
        print("Please parse your resume first using: python3 parsers/user_resume_parser.py")
        return
        
    profiles = load_profiles(profiles_path)
    if not profiles:
        print("❌ Error: No user profiles found in database.")
        return
        
    user = profiles[0]
    user_name = user.get("name", "Unknown User")
    user_skills = user.get("skills", [])
    
    print(f"Logged in as: {user_name}")
    print(f"Your Skills ({len(user_skills)}): {', '.join(user_skills)}\n")
    
    # 2. Get search keyword from the user
    keyword = input("Enter keyword to search for internships (e.g. 'machine learning', 'python'): ").strip()
    if not keyword:
        print("❌ Search keyword cannot be empty!")
        return
        
    print(f"\n[1/2] Fetching up to 10 opportunities for '{keyword}' from Internshala...")
    # Scrape exactly 10 internships
    jobs = scrape_internshala(keyword, limit=10)
    
    if not jobs:
        print("❌ No internships found for that keyword. Try another term.")
        return
        
    # 3. Save to jobs.json for persistence
    jobs_path = os.path.join(current_dir, "data", "jobs.json")
    with open(jobs_path, "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=4)
        
    # 4. Run Matching Engine & Rank Jobs
    print(f"\n[2/2] Matching your profile against {len(jobs)} retrieved opportunities...")
    ranked_results = rank_jobs(user, jobs)
    
    # 5. Output results beautifully
    print("\n=====================================================")
    print(f"📊 RANKED MATCHES FOR {user_name.upper()} 📊")
    print("=====================================================\n")
    
    for idx, match in enumerate(ranked_results, start=1):
        job_title = match["job_title"]
        score = match["score"]
        matched_skills = match["matched_skills"]
        missing_skills = match["missing_skills"]
        
        # Find company name from matched job
        company = "Unknown Company"
        stipend = "Negotiable"
        for j in jobs:
            if j["job_title"] == job_title:
                company = j.get("company", company)
                stipend = j.get("stipend", stipend)
                break
                
        print(f"{idx}. {job_title} at {company}")
        print(f"   Stipend: {stipend}")
        print(f"   Match Score: {score}%")
        print(f"   Matched Skills: {', '.join(matched_skills) if matched_skills else 'None'}")
        print(f"   Missing Skills: {', '.join(missing_skills) if missing_skills else 'None'}")
        print("-" * 50)
        
    print(f"\nResults saved to database files inside the data/ folder. ✅")

if __name__ == "__main__":
    main()
