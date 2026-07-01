import requests
from bs4 import BeautifulSoup
import json
import os
import urllib.parse
import time
from typing import List, Dict, Any

# Resolve project root and save jobs.json correctly in the data/ folder
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(CURRENT_DIR)
OUTPUT_FILE = os.path.join(project_root, "data", "jobs.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def get_job_skills(detail_url: str) -> List[str]:
    """
    Navigates to the internship detail page to extract required skills.
    """
    try:
        response = requests.get(detail_url, headers=HEADERS, timeout=10)
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        skills = []
        
        # Internshala puts skills inside span tags with class 'round_tabs'
        # or inside a 'Skills required' section.
        skill_tags = soup.find_all('span', class_='round_tabs')
        
        # Filter out common benefits/non-skills that Internshala lists in the same tabs
        ignored_tags = {
            "certificate", "letter of recommendation", "flexible work hours", 
            "informal dress code", "5 days a week", "free snacks & beverages", 
            "job offer", "women wanting to start/restart their career can also apply"
        }
        
        for tag in skill_tags:
            skill_name = tag.text.strip()
            if skill_name and skill_name.lower() not in ignored_tags:
                if skill_name not in skills:
                    skills.append(skill_name)
                
        # If no skills found via class, look in container text
        if not skills:
            skills_container = soup.find('div', class_='round_tabs_container')
            if skills_container:
                for span in skills_container.find_all('span'):
                    val = span.text.strip()
                    if val and val.lower() not in ignored_tags:
                        if val not in skills:
                            skills.append(val)
                        
        return skills
    except Exception as e:
        print(f"Error fetching skills from {detail_url}: {e}")
        return []

from concurrent.futures import ThreadPoolExecutor

def scrape_internshala(search_query: str, limit: int = 25) -> List[Dict[str, Any]]:
    """
    Scrapes Internshala search listings and fetches required skills from the detail pages concurrently.
    """
    print(f"Searching Internshala for '{search_query}' (limit: {limit})...")
    encoded_query = urllib.parse.quote(search_query)
    url = f"https://internshala.com/internships/keywords-{encoded_query}/"
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200:
            print(f"Failed to fetch listings: HTTP {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        cards = soup.find_all('div', class_='individual_internship')
        
        pre_jobs = []
        for card in cards:
            if len(pre_jobs) >= limit:
                break
                
            title_el = card.find('h2', class_='job-internship-name')
            company_el = card.find('p', class_='company-name')
            stipend_el = card.find('span', class_='stipend')
            location_el = card.find('a', class_='location_link')
            link_el = card.find('a', href=True)
            
            title = title_el.text.strip() if title_el else "Unknown Internship"
            company = company_el.text.strip() if company_el else "Unknown Company"
            stipend = stipend_el.text.strip() if stipend_el else "Negotiable"
            location = location_el.text.strip() if location_el else "Remote"
            
            duration = "Not specified"
            detail_row = card.find('div', class_='detail-row-1')
            if detail_row:
                items = detail_row.find_all('div', class_='row-1-item')
                for item in items:
                    text = item.text.strip()
                    if ('month' in text.lower() or 'week' in text.lower()) and not any(c in text for c in ['₹', '$', '/month', 'stipend']):
                        duration = text

            # Form complete URL for detail page
            link = ""
            if link_el and link_el['href'].startswith('/internship/detail/'):
                link = "https://internshala.com" + link_el['href']
            
            if not link:
                continue
                
            pre_jobs.append({
                "job_title": title,
                "company": company,
                "location": location,
                "stipend": stipend,
                "duration": duration,
                "url": link
            })
            
        if not pre_jobs:
            return []

        # Fetch required skills concurrently
        def fetch_skills_task(job):
            try:
                required_skills = get_job_skills(job["url"])
            except Exception as thread_err:
                print(f"Thread fetch error for {job['url']}: {thread_err}")
                required_skills = []
                
            if not required_skills:
                required_skills = [search_query.capitalize()]
            job["required_skills"] = required_skills
            return job

        # Use ThreadPoolExecutor for concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            jobs = list(executor.map(fetch_skills_task, pre_jobs))
            
        return jobs
        
    except Exception as e:
        print(f"Error scraping listings: {e}")
        return []

def main():
    # Scrape python internships
    jobs = scrape_internshala("python", limit=10)
    
    if jobs:
        # Save to jobs.json
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(jobs, f, indent=4)
        print(f"\nSuccessfully saved {len(jobs)} internships to {OUTPUT_FILE}! ✅")
    else:
        print("No jobs found to save.")

if __name__ == "__main__":
    main()
