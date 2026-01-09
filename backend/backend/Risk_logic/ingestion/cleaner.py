# ingestion/cleaner.py
"""
Text Cleaning and Normalization
- Removes headers/footers/page numbers
- Fixes OCR artifacts and wrapped lines
- Preserves clause structure where possible
"""

import re

HEADER_FOOTER_PATTERNS = [
    re.compile(r'^page\s+\d+(\s+of\s+\d+)?$', re.IGNORECASE),
    re.compile(r'^page\s*\d+\s*/\s*\d+$', re.IGNORECASE),
    re.compile(r'^\d+\s+of\s+\d+$', re.IGNORECASE),
    re.compile(r'^copyright\b', re.IGNORECASE),
    re.compile(r'^all rights reserved\b', re.IGNORECASE),
    re.compile(r'^confidential\b', re.IGNORECASE),
]

SENTENCE_END_CHARS = ('.', '?', '!', ':', ';', ')')

def _strip_headers_footers(lines):
    cleaned = []
    for line in lines:
        norm = line.strip()
        if not norm:
            cleaned.append("")
            continue
        # Drop obvious header/footer noise
        if any(pat.search(norm) for pat in HEADER_FOOTER_PATTERNS):
            continue
        cleaned.append(norm)
    return cleaned

def _merge_wrapped_lines(lines):
    """
    Merge lines that are likely soft-wrapped (common in PDFs/OCR)
    while keeping blank lines as paragraph breaks.
    """
    merged = []
    buffer = ""

    for line in lines:
        if not line:
            if buffer:
                merged.append(buffer.strip())
                buffer = ""
            merged.append("")  # keep paragraph break
            continue

        if buffer:
            if not buffer.endswith(SENTENCE_END_CHARS):
                buffer += " " + line
            else:
                merged.append(buffer.strip())
                buffer = line
        else:
            buffer = line

    if buffer:
        merged.append(buffer.strip())

    return merged

def clean_text(text: str) -> str:
    """
    Normalize contract text for NLP processing.
    """
    if not text:
        return ""

    # Fix common OCR hyphenation
    text = text.replace("-\n", "")

    # Normalize spaces and tabs early
    text = re.sub(r'[ \t]+', ' ', text)

    # Work line-by-line
    lines = [line.strip() for line in text.splitlines()]

    # Remove headers/footers/page numbers
    lines = _strip_headers_footers(lines)

    # Merge wrapped lines but keep paragraph breaks
    lines = _merge_wrapped_lines(lines)

    # Rebuild text
    text = "\n".join(lines)

    # Collapse excessive blank lines (keep double newline for structure)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()