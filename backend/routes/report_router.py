from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from config.database import get_db
from config.models import User
from routes.auth import get_current_user
from services.report_export.csv_exporter import export_csv
from services.report_export.html_exporter import export_html
from services.report_export.pdf_exporter import export_pdf
from services.report_export.report_builder import build_report

router = APIRouter(prefix="/reports/export", tags=["Report Export"])

EXPORTERS = {
    "pdf": (export_pdf, "application/pdf", "career-intelligence-report.pdf"),
    "csv": (export_csv, "text/csv; charset=utf-8", "career-intelligence-report.csv"),
    "html": (export_html, "text/html; charset=utf-8", "career-intelligence-report.html"),
}


def _export(format_name: str, current_user: User, db: Session) -> Response:
    exporter, media_type, filename = EXPORTERS[format_name]
    # This only reads persisted records. It intentionally never invokes AI, ATS, scraping, or matching.
    content = exporter(build_report(current_user, db))
    return Response(content=content, media_type=media_type, headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.post("/pdf")
def export_pdf_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _export("pdf", current_user, db)


@router.post("/csv")
def export_csv_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _export("csv", current_user, db)


@router.post("/html")
def export_html_report(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _export("html", current_user, db)
