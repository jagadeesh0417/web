"""Export measured image properties without implying a defect diagnosis."""
from datetime import datetime, timezone
from io import BytesIO
from uuid import uuid4

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from PIL import Image

def create_report(rgb, measurements):
    output = BytesIO()
    pdf = canvas.Canvas(output, pagesize=A4)
    width, height = A4
    pdf.setTitle('STRUCTURA-AI image processing report')
    pdf.setFont('Helvetica-Bold', 17)
    pdf.drawString(40, height - 48, 'STRUCTURA-AI | Image processing report')
    pdf.setFont('Helvetica', 9)
    pdf.drawString(40, height - 68, f'Report ID: {uuid4()}')
    pdf.drawString(40, height - 82, f'Created (UTC): {datetime.now(timezone.utc).isoformat(timespec="seconds")}')
    image_file = BytesIO()
    Image.fromarray(rgb).save(image_file, format='PNG')
    image_file.seek(0)
    pdf.drawImage(ImageReader(image_file), 40, height - 330, width=width - 80, height=225, preserveAspectRatio=True, anchor='c')
    y = height - 355
    pdf.setFont('Helvetica-Bold', 11)
    pdf.drawString(40, y, 'Measured image properties')
    y -= 20
    pdf.setFont('Helvetica', 10)
    for key, value in measurements.items():
        text = f'{key}: {value:.3f}' if isinstance(value, float) else f'{key}: {value}'
        pdf.drawString(40, y, text)
        y -= 16
    y -= 8
    pdf.setFillColor(colors.darkred)
    for line in ('No validated defect prediction or inspection priority is available.',
                 'This image report does not establish structural safety or internal corrosion.',
                 'Consult a qualified engineer; manual inspection is required.'):
        pdf.drawString(40, y, line)
        y -= 15
    pdf.showPage()
    pdf.save()
    return output.getvalue()
