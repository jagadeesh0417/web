import numpy as np
from pdf_report import create_report

def test_pdf_contains_document():
    result = create_report(np.zeros((32, 32, 3), dtype=np.uint8), {'width_px': 32})
    assert result.startswith(b'%PDF-')
    assert b'%%EOF' in result[-64:]
