# segmentation/clause_splitter.py
"""
Clause Segmentation Module
Splits contract text into individual clauses with structure preservation
"""

from .patterns import is_clause_heading

FOOTER_KEYWORDS = [
    "Copyright ©",
    "All Rights Reserved",
    "Page ",
    "Confidential",
]

SENTENCE_END_CHARS = (".", "?", "!", ";", ":")


def strip_footer_noise(line: str) -> str:
    """Remove common footer elements from lines."""
    for keyword in FOOTER_KEYWORDS:
        if keyword in line:
            parts = line.split(keyword)
            if len(parts) > 1:
                return parts[-1].strip()
            return ""
    return line


def merge_wrapped_lines(text: str) -> str:
    """
    Merge soft-wrapped lines (common in PDFs/OCR) while keeping paragraph breaks.
    """
    lines = [strip_footer_noise(l).strip() for l in text.splitlines()]
    merged = []
    buffer = ""

    for line in lines:
        if not line:
            if buffer:
                merged.append(buffer.strip())
                buffer = ""
            merged.append("")  # preserve blank line as paragraph break
            continue

        if buffer:
            if not buffer.endswith(SENTENCE_END_CHARS) and line[:1].islower():
                buffer += " " + line
            else:
                merged.append(buffer.strip())
                buffer = line
        else:
            buffer = line

    if buffer:
        merged.append(buffer.strip())

    return "\n".join(merged)


    def fallback_segment(text: str):
        """
        Fallback segmentation when no headings detected.
        Splits by paragraphs or sentences as a last resort.
        """
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    
        if not paragraphs:
            # Try splitting by single newlines
            paragraphs = [p.strip() for p in text.split("\n") if p.strip() and len(p.strip()) > 50]
    
        if not paragraphs:
            # Last resort: treat entire text as one clause
            return [{
                "id": "1",
                "title": "Contract",
                "text": text.strip()
            }] if text.strip() else []
    
        clauses = []
        for i, para in enumerate(paragraphs[:20], 1):  # Limit to 20 paragraphs
            if len(para) > 30:  # Skip very short paragraphs
                clauses.append({
                    "id": str(i),
                    "title": f"Section {i}",
                    "text": para
                })
    
        return clauses if clauses else [{
            "id": "1",
            "title": "Contract",
            "text": text.strip()
        }]


def segment_clauses(text: str):
    """
    Segment contract text into distinct clauses.

    Uses pattern matching to identify clause headings and boundaries.
    Preserves clause numbering and titles.

    Args:
        text: Clean contract text

    Returns:
        List of clause dictionaries with 'id', 'title', 'text'
    """
    if not text or not text.strip():
        return []
    
    clauses = []
    current_clause = None
    detected_any_heading = False

    # Pre-merge wrapped lines to reduce false splits
    normalized_text = merge_wrapped_lines(text)

    # Token-level scanning for better heading detection
    tokens = normalized_text.split()
    buffer = ""

    for token in tokens:
        buffer += token + " "

        # Try detecting a clause heading in the buffer
        is_heading, info = is_clause_heading(buffer.strip())

        # Guard against footer/page artifacts posing as headings
        title = (info.get("title") or "").strip()
        if is_heading and title.upper().startswith("PAGE"):
            is_heading = False
            info = {}

        if is_heading:
            if current_clause:
                current_clause["text"] = current_clause["text"].strip()
                clauses.append(current_clause)

            current_clause = {
                "id": info.get("num", ""),
                "title": title.split(".")[0].strip(),
                "text": ""
            }

            buffer = ""  # reset buffer after clause start

        else:
            if current_clause:
                current_clause["text"] += token + " "

    if current_clause:
        current_clause["text"] = current_clause["text"].strip()
        clauses.append(current_clause)

    # Fallback segmentation if no headings detected
    if not clauses or len(clauses) == 0:
        clauses = fallback_segment(normalized_text)
    
    return clauses