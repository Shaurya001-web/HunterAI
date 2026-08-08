def generate_html_report(data: dict) -> str:
    # Use simple standard HTML formatted nicely based on the text template structure
    
    matched_skills = "".join([f"<li>{skill}</li>" for skill in data.get("matched_skills", [])])
    if not matched_skills:
        matched_skills = "<li>Not Available</li>"
        
    skill_gaps = "".join([f"<li>{skill}</li>" for skill in data.get("skill_gaps", [])])
    if not skill_gaps:
        skill_gaps = "<li>None</li>"
        
    recs = "".join([f"<li>{rec}</li>" for rec in data.get("recommendations", [])])
    if not recs:
        recs = "<li>No recommendations available.</li>"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hunter AI Job Analysis Report</title>
    <style>
        body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }}
        h1 {{ color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
        h2 {{ color: #34495e; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px; }}
        .section {{ margin-bottom: 20px; }}
        .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }}
        .label {{ font-weight: bold; color: #555; }}
        .value {{ color: #111; }}
        .footer {{ margin-top: 50px; text-align: center; font-size: 0.9em; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 10px; }}
        ul {{ list-style-type: none; padding-left: 0; }}
        ul.check-list li::before {{ content: "✓ "; color: #27ae60; font-weight: bold; }}
        ul.cross-list li::before {{ content: "✗ "; color: #c0392b; font-weight: bold; }}
        ul.num-list {{ list-style-type: decimal; padding-left: 20px; }}
        .score-box {{ background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }}
        .score-box .score {{ font-size: 24px; font-weight: bold; color: #2980b9; }}
    </style>
</head>
<body>

    <h1>HUNTER AI JOB ANALYSIS REPORT</h1>
    
    <div class="grid" style="margin-bottom: 30px;">
        <div>
            <div class="label">Candidate</div>
            <div class="value">{data.get("candidate_name")}</div>
        </div>
        <div>
            <div class="label">Target Role</div>
            <div class="value">{data.get("target_role")}</div>
        </div>
        <div>
            <div class="label">Generated</div>
            <div class="value">{data.get("generated_date")}</div>
        </div>
    </div>

    <h2>1. TASK INFORMATION</h2>
    <div class="grid section">
        <div><span class="label">Task:</span> <span class="value">AI Job Match Analysis</span></div>
        <div><span class="label">Task ID:</span> <span class="value">{data.get("task_id")}</span></div>
        <div><span class="label">Status:</span> <span class="value">{data.get("status")}</span></div>
        <div><span class="label">Created:</span> <span class="value">{data.get("generated_date")}</span></div>
    </div>

    <h2>2. JOB INFORMATION</h2>
    <div class="grid section">
        <div><span class="label">Job Title:</span> <span class="value">{data.get("job_title")}</span></div>
        <div><span class="label">Company:</span> <span class="value">{data.get("company")}</span></div>
        <div><span class="label">Location:</span> <span class="value">{data.get("location")}</span></div>
        <div><span class="label">Experience Required:</span> <span class="value">{data.get("experience_required")}</span></div>
        <div><span class="label">Job Source:</span> <span class="value">{data.get("job_source")}</span></div>
        <div><span class="label">Job Link:</span> <span class="value"><a href="{data.get("job_link")}">{data.get("job_link")}</a></span></div>
    </div>

    <h2>3. AI MATCH ANALYSIS</h2>
    <div class="section">
        <div class="score-box" style="margin-bottom: 15px;">
            <div class="label">Overall Match Score</div>
            <div class="score">{data.get("overall_score")}%</div>
        </div>
        <div class="grid">
            <div><span class="label">Resume Match:</span> <span class="value">{data.get("resume_score")}%</span></div>
            <div><span class="label">Skills Match:</span> <span class="value">{data.get("skills_score")}%</span></div>
            <div><span class="label">Experience Match:</span> <span class="value">{data.get("experience_score")}%</span></div>
            <div><span class="label">Education Match:</span> <span class="value">{data.get("education_score")}%</span></div>
        </div>
    </div>

    <h2>4. MATCHING SKILLS</h2>
    <div class="section">
        <ul class="check-list">
            {matched_skills}
        </ul>
    </div>

    <h2>5. SKILL GAPS</h2>
    <div class="section">
        <ul class="cross-list">
            {skill_gaps}
        </ul>
    </div>

    <h2>6. AI RECOMMENDATIONS</h2>
    <div class="section">
        <ul class="num-list">
            {recs}
        </ul>
    </div>

    <h2>7. AGENT NOTES</h2>
    <div class="section">
        <p>{data.get("agent_notes")}</p>
    </div>
    
    <h2>8. TASK STATUS</h2>
    <div class="grid section">
        <div><span class="label">Status:</span> <span class="value">Completed</span></div>
        <div><span class="label">AI Analysis:</span> <span class="value">Completed</span></div>
        <div><span class="label">Recommendation:</span> <span class="value">Generated</span></div>
    </div>

    <div class="footer">
        Generated by Hunter AI
    </div>
</body>
</html>"""
    return html_content
