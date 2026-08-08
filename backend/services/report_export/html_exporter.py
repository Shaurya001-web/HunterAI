def generate_html_report(data: dict) -> str:
    top_5_html = ""
    for i, match in enumerate(data.get("top_5_matches", []), 1):
        top_5_html += f"""
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #2980b9;">#{i} - {match['job_title']}</h3>
            <p style="margin: 5px 0;"><strong>Company:</strong> {match['company']}</p>
            <p style="margin: 5px 0;"><strong>Match Score:</strong> <span style="color: #27ae60; font-weight: bold;">{match['score']}%</span></p>
            <p style="margin: 5px 0;"><strong>Link:</strong> <a href="{match['url']}" target="_blank">{match['url']}</a></p>
        </div>
        """
    if not top_5_html:
        top_5_html = "<p>No job matches found yet.</p>"

    matched_skills_html = "".join([f"<li>{s}</li>" for s in data.get("matched_skills", [])])
    if not matched_skills_html:
        matched_skills_html = "<li>Not Available</li>"

    skill_gaps_html = "".join([f"<li>{s}</li>" for s in data.get("skill_gaps", [])])
    if not skill_gaps_html:
        skill_gaps_html = "<li>None</li>"

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hunter AI - Dashboard Summary</title>
        <style>
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }}
            h1 {{ color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
            h2 {{ color: #34495e; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }}
            .stats-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }}
            .stat-box {{ background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e9ecef; }}
            .stat-value {{ font-size: 24px; font-weight: bold; color: #2980b9; }}
            .stat-label {{ font-size: 12px; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; }}
            ul {{ list-style-type: none; padding-left: 0; }}
            ul li {{ padding: 5px 0; }}
            ul li::before {{ content: "✓"; color: #27ae60; font-weight: bold; display: inline-block; width: 1em; margin-left: -1em; }}
            ul.gaps li::before {{ content: "✗"; color: #c0392b; }}
        </style>
    </head>
    <body>
        <h1>HUNTER AI<br><small style="font-size: 18px; color: #3498db;">DASHBOARD SUMMARY REPORT</small></h1>
        
        <p><strong>Candidate:</strong> {data.get("candidate_name")}</p>
        <p><strong>Generated:</strong> {data.get("generated_date")}</p>

        <h2>DASHBOARD STATISTICS</h2>
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-value">{data.get("total_matches")}</div>
                <div class="stat-label">Jobs Matched</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{data.get("avg_score")}%</div>
                <div class="stat-label">Avg Match Score</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">{data.get("top_score")}%</div>
                <div class="stat-label">Best Fit Score</div>
            </div>
        </div>

        <h2>TOP 5 MATCHED INTERNSHIPS</h2>
        {top_5_html}

        <h2>TOP MATCHED SKILLS (Across roles)</h2>
        <ul>
            {matched_skills_html}
        </ul>

        <h2>TOP SKILL GAPS (Across roles)</h2>
        <ul class="gaps">
            {skill_gaps_html}
        </ul>
    </body>
    </html>
    """
    return html
