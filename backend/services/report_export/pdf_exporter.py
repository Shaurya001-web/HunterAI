import io
from fpdf import FPDF
from services.report_export.text_exporter import generate_text_report

def generate_pdf_report(data: dict) -> bytes:
    # We will use the exact text format and print it nicely in a mono-spaced font on PDF
    text_content = generate_text_report(data)
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Courier", size=10)
    
    # Split text by lines and add them to the PDF
    for line in text_content.split('\n'):
        # using multicell or just cell
        # dealing with unicode like ✓ and ✗ - FPDF default Courier might not support it well,
        # but fpdf2 usually handles basic utf-8 if a font is provided.
        # To be safe with the default font, we replace them with standard chars if they fail,
        # or we just use them and rely on fpdf2's fallback.
        # FPDF2 supports unicode with standard fonts via warnings/fallbacks, let's keep it simple.
        line = line.replace("✓", "[+]").replace("✗", "[-]")
        pdf.cell(0, 5, txt=line, ln=True)
        
    return pdf.output(dest="S")
