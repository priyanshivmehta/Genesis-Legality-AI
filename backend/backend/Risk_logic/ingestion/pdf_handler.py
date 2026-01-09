# ingestion/pdf_handler.py
"""
PDF Text Extraction with OCR Fallback and lightweight heuristics
"""

import pdfplumber
from .ocr import extract_text_from_scanned_pdf

def _is_native_text(total_pages: int, text_pages: int, text: str) -> bool:
    """
    Decide if native text extraction is sufficient.
    Heuristics:
    - Enough characters overall
    - A reasonable fraction of pages yielded text
    """
    stripped = text.strip()
    if not stripped or total_pages == 0:
        return False

    ratio = text_pages / total_pages if total_pages else 0
    char_count = len(stripped)

    # Generous thresholds to avoid unnecessary OCR
    if char_count >= 800 and ratio >= 0.4:
        return True
    if char_count >= 400 and ratio >= 0.6:
        return True
    return False

def extract_text_from_pdf(pdf_path: str):
    """
    Try extracting text from digital PDF first.
    Fall back to OCR if needed.

    Returns:
        tuple: (text, ocr_used)
    """
    extracted_text = ""
    text_pages = 0
    total_pages = 0

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text_pages += 1
                    extracted_text += page_text + "\n"
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        extracted_text = ""

    if _is_native_text(total_pages, text_pages, extracted_text):
        return extracted_text, False

    # Fallback to OCR
    print("PDF appears to be scanned or low-text. Using OCR...")
    ocr_text = extract_text_from_scanned_pdf(pdf_path)
    return ocr_text, True