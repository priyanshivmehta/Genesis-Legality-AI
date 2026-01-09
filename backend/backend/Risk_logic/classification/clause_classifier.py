# classification/clause_classifier.py
"""
Clause Classification Module
Identifies the type and purpose of each contract clause with primary/secondary typing
"""

import re
from typing import Dict, List, Tuple

class ClauseClassifier:
    """
    Classifies contract clauses into legal categories using
    keyword matching and pattern recognition with weighted scoring.
    """
    
    # Weighting for title vs text matches
    TITLE_WEIGHT = 2.0
    TEXT_WEIGHT = 1.0
    
    # Priority order for tie-breaking
    TYPE_PRIORITY = [
        "INDEMNITY",
        "TERMINATION",
        "LIABILITY",
        "PAYMENT",
        "CONFIDENTIALITY",
        "INTELLECTUAL_PROPERTY",
        "GOVERNING_LAW",
        "DISPUTE_RESOLUTION",
        "NON_COMPETE",
        "WARRANTY",
        "FORCE_MAJEURE",
        "ASSIGNMENT",
        "AMENDMENT",
        "SEVERABILITY",
        "ENTIRE_AGREEMENT",
        "GENERAL",
    ]
    
    CLAUSE_PATTERNS = {
        "INDEMNITY": [
            r'\bindemnif(y|ication|ied)\b',
            r'\bhold\s+harmless\b',
            r'\bdefend.*against\b',
            r'\bliable.*for.*damages\b',
            r'\breimburse.*losses\b',
        ],
        "TERMINATION": [
            r'\btermination\b',
            r'\bterminat(e|ed|ing)\b',
            r'\bend.*agreement\b',
            r'\bcancel(lation)?\b',
            r'\bwithdraw.*from\b',
            r'\bnotice.*to.*terminate\b',
        ],
        "PAYMENT": [
            r'\bpayment\b',
            r'\bfees?\b',
            r'\bcompensation\b',
            r'\bremuneration\b',
            r'\$[\d,]+',
            r'\binvoice\b',
            r'\bdue.*upon\b',
        ],
        "CONFIDENTIALITY": [
            r'\bconfidential(ity)?\b',
            r'\bnon-disclosure\b',
            r'\bproprietary.*information\b',
            r'\btrade.*secret\b',
            r'\bnot.*disclose\b',
        ],
        "LIABILITY": [
            r'\bliability\b',
            r'\bliable\b',
            r'\bdamages\b',
            r'\bloss(es)?\b',
            r'\bclaims?\b',
            r'\blimitation.*of.*liability\b',
        ],
        "INTELLECTUAL_PROPERTY": [
            r'\bintellectual\s+property\b',
            r'\bcopyright\b',
            r'\bpatent\b',
            r'\btrademark\b',
            r'\bownership.*of.*work\b',
            r'\blicense\b',
        ],
        "GOVERNING_LAW": [
            r'\bgoverning\s+law\b',
            r'\bjurisdiction\b',
            r'\bapplicable.*law\b',
            r'\bcourts?\s+of\b',
            r'\blaws?\s+of.*state\b',
        ],
        "WARRANTY": [
            r'\bwarrant(y|ies|ed)\b',
            r'\brepresent(ation)?s?\b',
            r'\bguarantee\b',
            r'\bas\s+is\b',
            r'\bno.*warranty\b',
        ],
        "FORCE_MAJEURE": [
            r'\bforce\s+majeure\b',
            r'\bact.*of.*god\b',
            r'\bunavoidable.*circumstance\b',
            r'\bbeyond.*reasonable.*control\b',
        ],
        "DISPUTE_RESOLUTION": [
            r'\bdispute.*resolution\b',
            r'\barbitration\b',
            r'\bmediation\b',
            r'\blitigation\b',
            r'\bresolve.*disputes?\b',
        ],
        "NON_COMPETE": [
            r'\bnon-compete\b',
            r'\bcompetitive.*activity\b',
            r'\brestrictive.*covenant\b',
            r'\bnot.*compete\b',
        ],
        "ASSIGNMENT": [
            r'\bassignment\b',
            r'\bassign.*rights\b',
            r'\btransfer.*agreement\b',
            r'\bnot.*assign.*without\b',
        ],
        "AMENDMENT": [
            r'\bamendment\b',
            r'\bmodif(y|ication)\b',
            r'\bchange.*terms\b',
            r'\bvaried.*by.*writing\b',
        ],
        "SEVERABILITY": [
            r'\bseverability\b',
            r'\bseverable\b',
            r'\binvalid.*provision\b',
            r'\bunenforceable.*term\b',
        ],
        "ENTIRE_AGREEMENT": [
            r'\bentire\s+agreement\b',
            r'\bsupersede\b',
            r'\bprior.*agreement\b',
            r'\bintegration\s+clause\b',
        ],
    }
    
    def classify_types(self, clause_text: str, clause_title: str = "") -> Dict[str, List[str]]:
        """
        Classify a clause with weighted scoring to determine primary and secondary types.
        
        Args:
            clause_text: The clause content
            clause_title: Optional clause title/heading
            
        Returns:
            Dict with primary_type, secondary_types, and ordered types list
        """
        title = clause_title.lower()
        body = clause_text.lower()
        scores = {}
        
        # Score each clause type based on pattern matches
        for clause_type, patterns in self.CLAUSE_PATTERNS.items():
            score = 0.0
            for pattern in patterns:
                # Title matches are weighted higher
                if re.search(pattern, title, re.IGNORECASE):
                    score += self.TITLE_WEIGHT
                # Text matches contribute less
                if re.search(pattern, body, re.IGNORECASE):
                    score += self.TEXT_WEIGHT
            
            if score > 0:
                scores[clause_type] = score
        
        # Sort by score (desc), then by priority order
        ordered = sorted(
            scores.items(),
            key=lambda kv: (
                -kv[1],  # Higher score first
                self.TYPE_PRIORITY.index(kv[0]) if kv[0] in self.TYPE_PRIORITY else len(self.TYPE_PRIORITY)
            )
        )
        
        types = [t for t, _ in ordered] or ["GENERAL"]
        
        return {
            "primary_type": types[0],
            "secondary_types": types[1:3] if len(types) > 1 else [],
            "types": types,
        }
    
    def classify(self, clause_text: str, clause_title: str = "") -> List[str]:
        """
        Classify a clause into one or more categories.
        
        Args:
            clause_text: The clause content
            clause_title: Optional clause title/heading
            
        Returns:
            List of matched clause types
        """
        return self.classify_types(clause_text, clause_title)["types"]
    
    def get_primary_type(self, clause_text: str, clause_title: str = "") -> str:
        """
        Get the most likely primary clause type.
        """
        return self.classify_types(clause_text, clause_title)["primary_type"]
    
    