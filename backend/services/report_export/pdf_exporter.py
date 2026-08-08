"""A dependency-free, printable PDF exporter for fast server-side report delivery."""
import re
from .schemas import CareerReport


def _escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _lines(report):
    yield ("HUNTER AI", 22, True); yield ("CAREER INTELLIGENCE REPORT", 26, True); yield ("", 12, False)
    yield (f"Prepared for {report.candidate_name}", 16, False); yield (f"Generated {report.generated_at}", 10, False)
    yield ("", 12, False); yield (f"Profile completion: {report.profile_completion}%", 12, False); yield (f"Resume parsing: {report.resume_parsing_status}", 12, False)
    for section in report.sections:
        yield ("", 10, False); yield (section.title.upper(), 15, True)
        text = "Not Available" if section.value == "Not Available" else str(section.value).replace("\n", " ")
        for line in re.findall(r".{1,92}(?:\s+|$)", text) or [text]:
            yield (line.strip(), 10, False)


def export_pdf(report: CareerReport) -> bytes:
    pages, page, y = [], [], 760
    for text, size, bold in _lines(report):
        if y < 65:
            pages.append(page); page, y = [], 760
        font = "F2" if bold else "F1"
        page.append(f"BT /{font} {size} Tf 54 {y} Td ({_escape(text)}) Tj ET")
        y -= max(16, size + 5)
    pages.append(page)
    objects = ["<< /Type /Catalog /Pages 2 0 R >>", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"]
    page_ids = []
    for page in pages:
        content = "\n".join(page + ["BT /F1 8 Tf 54 30 Td (Hunter AI Career Intelligence Report) Tj ET"])
        content_id = len(objects) + 1; objects.append(f"<< /Length {len(content.encode('latin-1', 'replace'))} >>\nstream\n{content}\nendstream")
        page_id = len(objects) + 1; page_ids.append(page_id); objects.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {content_id} 0 R >>")
    objects[1] = "<< /Type /Pages /Kids [" + " ".join(f"{i} 0 R" for i in page_ids) + f"] /Count {len(page_ids)} >>"
    output = "%PDF-1.4\n"; offsets = [0]
    for i, obj in enumerate(objects, 1):
        offsets.append(len(output.encode("latin-1"))); output += f"{i} 0 obj\n{obj}\nendobj\n"
    xref = len(output.encode("latin-1")); output += f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n" + "".join(f"{o:010d} 00000 n \n" for o in offsets[1:]) + f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF"
    return output.encode("latin-1", "replace")

