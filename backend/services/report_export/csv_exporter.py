import csv
import io

def generate_csv_report(data: dict) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write Overview
    writer.writerow(["Dashboard Summary Report"])
    writer.writerow(["Candidate Name", data.get("candidate_name")])
    writer.writerow(["Generated Date", data.get("generated_date")])
    writer.writerow([])
    
    # Write Stats
    writer.writerow(["DASHBOARD STATISTICS"])
    writer.writerow(["Total Jobs Matched", data.get("total_matches")])
    writer.writerow(["Average Match Score (%)", data.get("avg_score")])
    writer.writerow(["Best Fit Score (%)", data.get("top_score")])
    writer.writerow([])
    
    # Write Top 5
    writer.writerow(["TOP 5 MATCHED INTERNSHIPS"])
    writer.writerow(["Rank", "Job Title", "Company", "Score (%)", "Link"])
    for i, match in enumerate(data.get("top_5_matches", []), 1):
        writer.writerow([i, match["job_title"], match["company"], match["score"], match["url"]])
    writer.writerow([])
    
    # Write Skills
    writer.writerow(["TOP MATCHED SKILLS (Across roles)"])
    writer.writerow(data.get("matched_skills", []))
    writer.writerow([])
    
    writer.writerow(["TOP SKILL GAPS (Across roles)"])
    writer.writerow(data.get("skill_gaps", []))
    writer.writerow([])
    
    return output.getvalue()
