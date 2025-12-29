# ingestion/input_handler.py
"""
Input Handler - Main entry point for document ingestion
"""

from .pdf_handler import extract_text_from_pdf
from .docx_handler import extract_text_from_docx
from .image_handler import extract_text_from_image
from .cleaner import clean_text

def ingest_contract(file_path: str = None, pasted_text: str = None):
    """
    Ingest contract from various sources.
    
    Args:
        file_path: Path to PDF, DOCX, or image file
        pasted_text: Direct text paste
        
    Returns:
        Dict with 'text' and 'metadata'
    """
    metadata = {
        "source": None,
        "ocr_used": False
    }

    if pasted_text:
        raw_text = pasted_text
        metadata["source"] = "pasted_text"

    elif file_path:
        lower = file_path.lower()

        if lower.endswith(".pdf"):
            raw_text, ocr_used = extract_text_from_pdf(file_path)
            metadata["source"] = "pdf"
            metadata["ocr_used"] = ocr_used

        elif lower.endswith(".docx"):
            raw_text = extract_text_from_docx(file_path)
            metadata["source"] = "docx"

        elif lower.endswith((".png", ".jpg", ".jpeg")):
            raw_text = extract_text_from_image(file_path)
            metadata["source"] = "image"
            metadata["ocr_used"] = True

        else:
            raise ValueError("Unsupported file format. Supported: PDF, DOCX, PNG, JPG, JPEG")

    else:
        raise ValueError("No contract input provided")

    return {
        "text": clean_text(raw_text),
        "metadata": metadata
    }