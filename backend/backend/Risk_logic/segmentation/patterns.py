# segmentation/patterns.py
"""
Legal Clause Boundary Detection

Detects clause headings using legal document grammar.
Rejects addresses, signatures, and non-legal lines.
Builds structural clause tree with parent-child relationships.
"""

import re

# ============================================================================
# MAIN HEADING DETECTION REGEX
# ============================================================================
# Matches valid legal clause headings:
#   - Numeric: "1.", "2.1", "2.1.3", "10. Standstill. Each party..."
#   - Also: "2.3 Use" (no period after number)
#   - ARTICLE/SECTION: "ARTICLE V – Termination"
#
# Does NOT match:
#   - "750 University Avenue" (address)
#   - "CA 95031" (state code)
#   - "Attention: Bill Walker" (contact info)

CLAUSE_HEADING_REGEX = re.compile(
    r"""
    ^                                          # Start of line
    (?:
        (\d+(?:\.\d+)*)                        # Numeric: 1, 2.1, 2.1.3 (group 1)
        [.)]?\s+                               # Optional period/paren, then space
        ([A-Z][A-Za-z0-9 ,\-()]{2,})           # Title (min 2 chars) (group 2)
    |
        (ARTICLE|SECTION)\s+                   # ARTICLE/SECTION keyword (group 3)
        ([IVXivx0-9]+)                         # Roman/numeric ID (group 4)
        \s*[–\-]?\s*
        ([A-Z][A-Za-z0-9 ,\-()]{2,})           # Title (group 5)
    )
    """,
    flags=re.VERBOSE | re.MULTILINE,
)

# ============================================================================
# NON-HEADING FILTER
# ============================================================================
# These keywords/patterns indicate a line is NOT a valid clause heading

NON_HEADING_KEYWORDS = {
    # Street/address terms ONLY
    # (Removed state codes because they can cause false positives when truncating at 100 chars)
    "Road", "Avenue", "Ave", "Street", "St", "Boulevard", "Blvd", "Drive", "Dr",
    "Lane", "Ln", "Court", "Ct", "Place", "Pl", "Way", "Parkway", "Pkwy",
    "Building", "Floor", "Suite", "Ste", "Box", "PO", "Apartment", "Apt",
    # Contact/signature info
    "Attention", "Facsimile", "Fax", "Phone", "Tel", "Email", "Contact",
    "Signature", "By /s/", "Title", "IN WITNESS", "WHEREOF",
    # Document/exhibit markers
    "Page", "Exhibit", "Appendix", "Schedule",
    # Miscellaneous
    "USA", "United States", "Zip", "Postal", "Telephone",
}

# Patterns that indicate non-headings
ZIP_CODE_PATTERN = re.compile(r'\b\d{5}(?:-\d{4})?\b')
PHONE_PATTERN = re.compile(r'\d{3}[-.]?\d{3}[-.]?\d{4}')
PAGE_PATTERN = re.compile(r'(?:^|\s)(?:Page|p\.)\s+\d+', re.IGNORECASE)


# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def is_valid_heading(line: str) -> bool:
    """
    Validate that a line is a legitimate legal clause heading.
    
    Returns True only if:
      1. Line matches CLAUSE_HEADING_REGEX (numeric or ARTICLE/SECTION format)
      2. Does NOT contain address keywords, zip codes, phone numbers, signatures
      3. Clause numbers are in valid range (1-99)
    
    Returns False for:
      - Address lines: "750 University Avenue", "CA 95031"
      - Contact info: "Attention:", "Facsimile:", phone numbers
      - Signature blocks: "By /s/", "Title"
      - Noise: "Page 1 of 5", "Exhibit A"
    """
    line = line.strip()
    if not line:
        return False
    
    # Must match clause heading regex
    if not CLAUSE_HEADING_REGEX.match(line):
        return False
    
    # Extract just the heading part (first 100 chars) to avoid checking body text
    # for keywords that might appear in clause text
    heading_part = line[:100]
    
    # Reject if contains non-heading keywords (case-insensitive, word boundaries)
    # But only check first part to avoid false positives from body text
    heading_upper = heading_part.upper()
    for keyword in NON_HEADING_KEYWORDS:
        # For short keywords like state codes (CA, NY, PA), require word boundaries on BOTH sides
        # to avoid matching "PA" inside "PATENT"
        if len(keyword) <= 2:
            pattern = r'\b' + re.escape(keyword.upper()) + r'\b'
        else:
            pattern = r'\b' + re.escape(keyword.upper()) + r'\b'
        
        if re.search(pattern, heading_upper):
            return False
    
    # Reject if contains zip code
    if ZIP_CODE_PATTERN.search(line):
        return False
    
    # Reject if contains phone number
    if PHONE_PATTERN.search(line):
        return False
    
    # Reject if contains page marker
    if PAGE_PATTERN.search(line):
        return False
    
    # Validate clause number range if numeric
    num_match = re.match(r'^(\d+)', line)
    if num_match:
        main_num = int(num_match.group(1))
        if main_num < 1 or main_num > 99:
            return False
    
    return True


def extract_clause_number_and_title(line: str) -> tuple:
    """
    Extract (clause_id, title) from a validated heading line.
    
    Args:
        line: A heading line (should be validated by is_valid_heading first)
    
    Returns:
        (id_string, title_string) or (None, None) if parsing fails
    
    Examples:
      "2. Restrictions" -> ("2", "Restrictions")
      "2.4 Other Parties Bound" -> ("2.4", "Other Parties Bound")
      "ARTICLE V – Termination" -> ("ARTICLE V", "Termination")
    """
    line = line.strip()
    match = CLAUSE_HEADING_REGEX.match(line)
    if not match:
        return None, None
    
    groups = match.groups()
    
    if groups[0]:  # Numeric clause (group 1 and 2)
        clause_id = groups[0]
        title = groups[1]
    else:  # ARTICLE/SECTION (groups 3, 4, 5)
        keyword = groups[2]
        roman_id = groups[3]
        title = groups[4]
        clause_id = f"{keyword} {roman_id}"
    
    # Clean title: remove trailing punctuation
    title = re.sub(r'[.,:;]+\s*$', '', title.strip())
    
    return clause_id, title


def get_parent_clause_id(clause_id: str) -> str:
    """
    Given a clause ID, return the parent clause ID.
    
    Examples:
      "2.1" -> "2"
      "2.1.3" -> "2.1"
      "2" -> None (no parent)
      "ARTICLE V" -> None (no parent)
    """
    if not clause_id or "." not in str(clause_id):
        return None
    
    parts = str(clause_id).split(".")
    if len(parts) > 1:
        return ".".join(parts[:-1])
    return None


def is_subclause(clause_id: str) -> bool:
    """
    Return True if clause_id is a subclause (contains a decimal point).
    
    Examples:
      "2.1" -> True
      "2.1.3" -> True
      "2" -> False
      "ARTICLE V" -> False
    """
    return "." in str(clause_id)


def count_sentences(text: str) -> int:
    """
    Rough sentence count for clause integrity checks.
    Counts sentence-ending punctuation: . ! ?
    """
    if not text:
        return 0
    # Split by sentence-ending punctuation
    sentences = re.split(r'[.!?]+', text)
    # Count non-empty segments
    return len([s for s in sentences if s.strip()])


