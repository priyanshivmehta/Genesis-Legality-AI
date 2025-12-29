# segmentation/patterns.py
"""
Pattern Matching for Clause Headings
"""

import re

NUMBERED_HEADING = re.compile(
    r'(?P<num>\d+(\.\d+)*)([\.\)]?)\s+(?P<title>.+?)(\.?)$'
)
ALL_CAPS_HEADING = re.compile(
    r'^[A-Z][A-Z\s]{4,}$'
)
COLON_HEADING = re.compile(
    r'^(?P<title>[A-Za-z\s]+):$'
)

BLACKLIST_HEADINGS = {
    "DISCLOSING PARTY",
    "RECEIVING PARTY",
    "SIGNATURE",
    "WITNESS",
    "NOTARY",
    "DATE",
}


def is_valid_clause_number(num: str) -> bool:
    try:
        n = int(num.split(".")[0])
        return 1 <= n <= 50
    except Exception:
        return False


def is_clause_heading(line: str):
    line = line.strip()

    if line.upper() in BLACKLIST_HEADINGS:
        return False, {}

    for pattern in [NUMBERED_HEADING, ALL_CAPS_HEADING, COLON_HEADING]:
        match = pattern.search(line)
        if match:
            info = match.groupdict()

            num = info.get("num")
            if num and not is_valid_clause_number(num):
                return False, {}

            title = (info.get("title") or "").strip()
            if title.upper().startswith("PAGE"):
                return False, {}

            return True, info

    return False, {}