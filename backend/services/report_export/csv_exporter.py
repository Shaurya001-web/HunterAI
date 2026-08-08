import csv
import io
import json
from .schemas import CareerReport


def export_csv(report: CareerReport) -> bytes:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=["section", "field", "value"])
    writer.writeheader()
    writer.writerow({"section": "Candidate Information", "field": "name", "value": report.candidate_name})
    writer.writerow({"section": "Candidate Information", "field": "email", "value": report.candidate_email})
    writer.writerow({"section": "Report Metadata", "field": "generation_date", "value": report.generated_at})
    writer.writerow({"section": "Profile", "field": "completion", "value": report.profile_completion})
    writer.writerow({"section": "Profile", "field": "resume_parsing_status", "value": report.resume_parsing_status})
    for section in report.sections:
        value = section.value
        if isinstance(value, dict):
            for key, item in value.items():
                writer.writerow({"section": section.title, "field": key, "value": json.dumps(item, ensure_ascii=False) if isinstance(item, (dict, list)) else item})
        else:
            writer.writerow({"section": section.title, "field": "value", "value": json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list)) else value})
    return buffer.getvalue().encode("utf-8-sig")

