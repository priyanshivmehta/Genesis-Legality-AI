# ingestion/docx_handler.py
"""
DOCX Text Extraction
"""

from docx import Document

def extract_text_from_docx(docx_path: str) -> str:
    """
    Extract text from Word document.
    
    Args:
        docx_path: Path to .docx file
        
    Returns:
        Extracted text
    """
    try:
        doc = Document(docx_path)
        text = []
        
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text.append(paragraph.text)
        
        return "\n".join(text)
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""