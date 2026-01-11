# segmentation/clause_splitter.py
"""
Clause Segmentation with Tree Building

Two-stage parsing:
  Stage A: Scan all lines and detect heading boundaries
  Stage B: Build clause tree with parent-child relationships

Subclauses (2.1, 2.2) are nested under parent (2).
Only top-level clauses are returned.
"""

import re
from .patterns import (
    CLAUSE_HEADING_REGEX,
    is_valid_heading,
    extract_clause_number_and_title,
    get_parent_clause_id,
    is_subclause,
    count_sentences,
)

# ============================================================================
# LINE FILTERING
# ============================================================================

FOOTER_KEYWORDS = [
    "Copyright ©",
    "All Rights Reserved",
    "Page ",
]


def is_noise_line(line: str) -> bool:
    """Check if a line is footer/header noise (very strict)."""
    if not line or len(line.strip()) < 3:
        return True
    # Only match exact footer patterns
    for keyword in FOOTER_KEYWORDS:
        if keyword in line:
            return True
    # Very short lines like page numbers "1" or "- 1 -"
    if len(line.strip()) <= 5 and line.strip().replace("-", "").replace(".", "").isdigit():
        return True
    return False


# ============================================================================
# TWO-STAGE CLAUSE PARSING
# ============================================================================

def find_all_headings(text: str) -> list:
    """
    Stage A: Scan text and find all valid clause headings.
    
    Returns list of (line_index, line_text, clause_id, title)
    """
    headings = []
    lines = text.split('\n')
    
    for i, line in enumerate(lines):
        if is_noise_line(line):
            continue
        
        if is_valid_heading(line):
            clause_id, title = extract_clause_number_and_title(line)
            if clause_id and title:
                headings.append((i, line, clause_id, title))
    
    return headings


def build_clause_tree(text: str) -> list:
    """
    Stage B: Build clause tree with subclauses nested under parents.
    
    Returns list of top-level clause dicts:
      {
        "id": "2",
        "title": "Restrictions on Disclosure and Use",
        "text": "...",
        "subclauses": [
          { "id": "2.1", "title": "Non-disclosure", "text": "..." },
          ...
        ]
      }
    """
    if not text or not text.strip():
        return []
    
    lines = text.split('\n')
    headings = find_all_headings(text)
    
    if not headings:
        # Fallback: return text as single clause
        return [{
            "id": "1",
            "title": "Contract",
            "text": text.strip(),
            "subclauses": []
        }]
    
    clauses = {}  # {clause_id: clause_dict}
    
    # Process each heading and extract text until next heading
    for idx, (line_index, heading_line, clause_id, title) in enumerate(headings):
        # Find start of body text
        # Either rest of current line or next non-empty line
        body_start_line = line_index + 1
        
        # Extract body text (everything until next heading)
        body_lines = []
        
        # Check if there's body text after the heading on the same line
        match = CLAUSE_HEADING_REGEX.match(heading_line.strip())
        if match:
            end_pos = match.end()
            remainder = heading_line[end_pos:].strip()
            if remainder and remainder[0] not in '.:,':
                body_lines.append(remainder)
            elif remainder and remainder[0] in '.:,':
                body_lines.append(remainder[1:].strip())
        
        # Collect lines until next heading
        if idx + 1 < len(headings):
            next_heading_line = headings[idx + 1][0]
        else:
            next_heading_line = len(lines)
        
        for i in range(body_start_line, next_heading_line):
            line = lines[i].strip()
            if not is_noise_line(line):
                body_lines.append(line)
        
        # Build clause dict
        clause_text = " ".join(body_lines).strip()
        
        clause_dict = {
            "id": clause_id,
            "title": title,
            "text": clause_text,
            "subclauses": []
        }
        
        clauses[clause_id] = clause_dict
    
    # Organize into tree: move subclauses under parents
    top_level = []
    
    for clause_id, clause_dict in clauses.items():
        if is_subclause(clause_id):
            # This is a subclause - find parent
            parent_id = get_parent_clause_id(clause_id)
            if parent_id and parent_id in clauses:
                # Add to parent's subclauses
                clauses[parent_id]["subclauses"].append(clause_dict)
        else:
            # This is a top-level clause
            top_level.append(clause_dict)
    
    # Sort top-level by clause ID (natural sort)
    top_level.sort(key=lambda c: _clause_sort_key(c["id"]))
    
    # Apply integrity rules: merge short/empty clauses
    top_level = apply_integrity_rules(top_level)
    
    return top_level


def apply_integrity_rules(clauses: list) -> list:
    """
    Filter/merge clauses that are too short or noisy.
    
    A clause is "valid" if it:
      - Has >= 150 characters OR
      - Has >= 2 sentences OR
      - Has >= 1 subclause
    
    Otherwise merge with previous clause (if exists).
    """
    result = []
    
    for clause in clauses:
        text = clause["text"]
        subclauses = clause["subclauses"]
        
        # Calculate integrity score
        char_count = len(text)
        sentence_count = count_sentences(text)
        subclause_count = len(subclauses)
        
        is_valid = (
            char_count >= 150 or
            sentence_count >= 2 or
            subclause_count >= 1
        )
        
        if is_valid:
            # Keep this clause
            result.append(clause)
        elif result:
            # Merge into previous clause
            result[-1]["text"] += " " + text
    
    return result


def _clause_sort_key(clause_id: str) -> tuple:
    """
    Natural sort key for clause IDs.
    Converts "2.1.3" -> (2, 1, 3) for proper numeric sorting.
    """
    if "." in str(clause_id):
        try:
            parts = str(clause_id).split(".")
            return tuple(int(p) for p in parts)
        except ValueError:
            return (0,)
    else:
        try:
            return (int(str(clause_id).split()[0]),)
        except (ValueError, IndexError):
            return (0,)


def segment_clauses(text: str) -> list:
    """
    Main entry point: segment contract text into clauses.
    
    Returns list of top-level clauses with nested subclauses.
    """
    return build_clause_tree(text)
