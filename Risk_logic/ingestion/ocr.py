# ingestion/ocr.py
"""
OCR Module using Tesseract
"""

import pytesseract
from pdf2image import convert_from_path
from PIL import Image

# Configure Tesseract path (adjust for your system)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_scanned_pdf(pdf_path: str) -> str:
    """
    Extract text from scanned PDF using OCR.
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        Extracted text
    """
    try:
        pages = convert_from_path(pdf_path, dpi=300)
        text = ""
        for i, page in enumerate(pages, 1):
            print(f"  Processing page {i}/{len(pages)}...")
            page_text = pytesseract.image_to_string(page, config='--psm 6')
            text += page_text + "\n"
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

def extract_text_from_image_file(image_path: str) -> str:
    """
    Extract text from image file using OCR.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Extracted text
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, config='--psm 6')
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""