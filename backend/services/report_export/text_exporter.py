def generate_text_report(data: dict) -> str:
    lines = []
    lines.append("="*56)
    lines.append("                    HUNTERAI")
    lines.append("              DASHBOARD SUMMARY REPORT")
    lines.append("="*56)
    lines.append("")
    lines.append(f"Candidate: {data.get('candidate_name')}")
    lines.append(f"Generated: {data.get('generated_date')}")
    lines.append("")
    lines.append("-" * 56)
    lines.append("1. DASHBOARD STATISTICS")
    lines.append("-" * 56)
    lines.append(f"Total Jobs Matched: {data.get('total_matches')}")
    lines.append(f"Average Match Score: {data.get('avg_score')}%")
    lines.append(f"Best Fit Score: {data.get('top_score')}%")
    lines.append("")
    
    lines.append("-" * 56)
    lines.append("2. TOP 5 MATCHED INTERNSHIPS")
    lines.append("-" * 56)
    top_5 = data.get("top_5_matches", [])
    if top_5:
        for i, match in enumerate(top_5, 1):
            lines.append(f"#{i} - {match['job_title']}")
            lines.append(f"    Company: {match['company']}")
            lines.append(f"    Score: {match['score']}%")
            lines.append(f"    Link: {match['url']}")
            lines.append("")
    else:
        lines.append("No job matches found yet.")
        lines.append("")
        
    lines.append("-" * 56)
    lines.append("3. TOP MATCHED SKILLS (Across roles)")
    lines.append("-" * 56)
    skills = data.get("matched_skills", [])
    if skills:
        for s in skills:
            lines.append(f" [+] {s}")
    else:
        lines.append(" Not Available")
    lines.append("")

    lines.append("-" * 56)
    lines.append("4. TOP SKILL GAPS (Across roles)")
    lines.append("-" * 56)
    gaps = data.get("skill_gaps", [])
    if gaps:
        for g in gaps:
            lines.append(f" [-] {g}")
    else:
        lines.append(" None")
    lines.append("")

    return "\n".join(lines)
