# backend/backend/Risk_logic/ingestion/ocr.py

"""
OCR Module using Tesseract
"""

import pytesseract
from pdf2image import convert_from_path
from PIL import Image

# Configure Tesseract path (adjust for your system)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def _is_valid_text(text: str) -> bool:
    """
    Validate that extracted text is human-readable, not binary data.
    
    Args:
        text: Text to validate
        
    Returns:
        True if text appears valid
    """
    if not text or not text.strip():
        return False
    
    # Check for PDF binary markers
    if text.strip().startswith('%PDF'):
        return False
    
    # Check if text has reasonable ratio of printable characters
    printable_chars = sum(c.isprintable() or c.isspace() for c in text[:1000])
    total_chars = len(text[:1000])
    
    if total_chars == 0:
        return False
    
    # At least 80% should be printable
    if printable_chars / total_chars < 0.8:
        return False
    
    return True

def extract_text_from_scanned_pdf(pdf_path: str) -> str:
    """
    Extract text from scanned PDF using OCR.
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        Extracted text (empty string if extraction fails)
    """
    try:
        pages = convert_from_path(pdf_path, dpi=300)
        text = ""
        for i, page in enumerate(pages, 1):
            print(f"  Processing page {i}/{len(pages)}...")
            page_text = pytesseract.image_to_string(page, config='--psm 6')
            text += page_text + "\n"
        
        # Validate extracted text
        if not _is_valid_text(text):
            print("⚠️  OCR output appears invalid or empty")
            return ""
            
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
        Extracted text (empty string if extraction fails)
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image, config='--psm 6')
        
        # Validate extracted text
        if not _is_valid_text(text):
            print("⚠️  OCR output appears invalid or empty")
            return ""
            
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""
    