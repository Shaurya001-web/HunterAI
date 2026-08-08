import csv
import io

def generate_csv_report(data: dict) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write Candidate Info
    writer.writerow(["Candidate Name", data.get("candidate_name")])
    writer.writerow(["Target Role", data.get("target_role")])
    writer.writerow(["Generated Date", data.get("generated_date")])
    writer.writerow([])
    
    # Write Task Info
    writer.writerow(["Task", "AI Job Match Analysis"])
    writer.writerow(["Task ID", data.get("task_id")])
    writer.writerow(["Status", data.get("status")])
    writer.writerow([])
    
    # Write Job Info
    writer.writerow(["Job Title", data.get("job_title")])
    writer.writerow(["Company", data.get("company")])
    writer.writerow(["Location", data.get("location")])
    writer.writerow(["Experience Required", data.get("experience_required")])
    writer.writerow(["Job Source", data.get("job_source")])
    writer.writerow(["Job Link", data.get("job_link")])
    writer.writerow([])
    
    # Write Scores
    writer.writerow(["Overall Match Score", data.get("overall_score")])
    writer.writerow(["Resume Match", data.get("resume_score")])
    writer.writerow(["Skills Match", data.get("skills_score")])
    writer.writerow(["Experience Match", data.get("experience_score")])
    writer.writerow(["Education Match", data.get("education_score")])
    writer.writerow([])
    
    # Write Matched Skills
    writer.writerow(["Matching Skills"])
    for skill in data.get("matched_skills", []):
        writer.writerow(["", skill])
    writer.writerow([])
    
    # Write Skill Gaps
    writer.writerow(["Skill Gaps"])
    for skill in data.get("skill_gaps", []):
        writer.writerow(["", skill])
    writer.writerow([])
    
    # Write Recommendations
    writer.writerow(["Recommendations"])
    for i, rec in enumerate(data.get("recommendations", []), 1):
        writer.writerow(["", f"{i}. {rec}"])
    writer.writerow([])
    
    # Write Agent Notes
    writer.writerow(["Agent Notes"])
    writer.writerow(["", data.get("agent_notes")])
    
    return output.getvalue()
