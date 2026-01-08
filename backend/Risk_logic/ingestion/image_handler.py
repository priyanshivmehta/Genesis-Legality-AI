# ingestion/image_handler.py
"""
Image Text Extraction
"""

from .ocr import extract_text_from_image_file

def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from image file.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Extracted text
    """
    return extract_text_from_image_file(image_path)