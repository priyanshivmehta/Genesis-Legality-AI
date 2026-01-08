# ner/entity_extractor.py
"""
Named Entity Recognition Module
Extracts key entities from contract text: dates, money, parties, locations
"""

import re
from typing import Dict, List, Any
from datetime import datetime

class EntityExtractor:
    """
    Extracts named entities from contract clauses without external NER models.
    Uses regex patterns and heuristics for common legal entities.
    """
    
    # Money patterns
    MONEY_PATTERNS = [
        r'\$[\d,]+(?:\.\d{2})?',  # $1,000 or $1,000.00
        r'[\d,]+\s*(?:dollars?|USD|usd)',
        r'(?:dollars?|USD)\s*[\d,]+',
    ]
    
    # Date patterns
    DATE_PATTERNS = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',  # 12/31/2024
        r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b',
        r'\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b',
        r'\b\d{4}-\d{2}-\d{2}\b',  # ISO format
    ]
    
    # Duration patterns
    DURATION_PATTERNS = [
        r'\b\d+\s*(?:day|week|month|year)s?\b',
        r'\b(?:thirty|sixty|ninety)\s*(?:day|month)s?\b',
        r'\bwithin\s+\d+\s*(?:day|week|month)s?\b',
    ]
    
    # Party patterns (simplified)
    PARTY_INDICATORS = [
        r'(?:^|\b)(?:the\s+)?(?:Company|Corporation|LLC|Inc\.|Ltd\.|Limited|Partnership|Firm)\b',
        r'(?:Disclosing\s+Party|Receiving\s+Party|Client|Contractor|Vendor|Supplier|Customer)',
        r'(?:Employer|Employee|Consultant|Service\s+Provider)',
    ]
    
    # Location patterns
    LOCATION_PATTERNS = [
        r'\b(?:State|Commonwealth)\s+of\s+[A-Z][a-z]+\b',
        r'\b[A-Z][a-z]+,\s*[A-Z]{2}\b',  # City, ST
        r'\b(?:New\s+York|California|Delaware|Texas|Florida|Illinois|Massachusetts)\b',
    ]
    
    # Noise tokens to filter out
    NOISE_TOKENS = {
        "state, or", "proceeding, if", "or", "and", "the", "a", "an", 
        "of", "in", "to", "for", "with", "on", "at", "by", "from",
    }
    
    def _clean_entities(self, values: List[str], min_len: int = 2) -> List[str]:
        """
        Post-process entities to remove noise, normalize, and deduplicate.
        
        Args:
            values: Raw extracted entities
            min_len: Minimum length to keep
            
        Returns:
            Cleaned and deduplicated list
        """
        cleaned = []
        seen = set()
        
        for raw in values:
            # Strip punctuation fragments and normalize whitespace
            val = re.sub(r'\s+', ' ', raw.strip(" ,.;:-")).strip()
            
            # Skip if too short or in noise list
            if len(val) < min_len or val.lower() in self.NOISE_TOKENS:
                continue
            
            # Deduplicate case-insensitively
            key = val.lower()
            if key in seen:
                continue
            
            seen.add(key)
            cleaned.append(val)
        
        return cleaned
    
    def extract_all(self, text: str) -> Dict[str, List[Any]]:
        """
        Extract all entity types from text.
        
        Returns:
            Dictionary with keys: money, dates, durations, parties, locations
        """
        return {
            "money": self.extract_money(text),
            "dates": self.extract_dates(text),
            "durations": self.extract_durations(text),
            "parties": self.extract_parties(text),
            "locations": self.extract_locations(text),
        }
    
    def extract_money(self, text: str) -> List[str]:
        """Extract monetary amounts."""
        amounts = []
        for pattern in self.MONEY_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            amounts.extend(matches)
        return self._clean_entities(amounts, min_len=2)
    
    def extract_dates(self, text: str) -> List[str]:
        """Extract dates."""
        dates = []
        for pattern in self.DATE_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        return self._clean_entities(dates, min_len=4)
    
    def extract_durations(self, text: str) -> List[str]:
        """Extract time durations."""
        durations = []
        for pattern in self.DURATION_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            durations.extend(matches)
        return self._clean_entities(durations, min_len=3)
    
    def extract_parties(self, text: str) -> List[str]:
        """Extract party references."""
        parties = []
        for pattern in self.PARTY_INDICATORS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            parties.extend(matches)
        return self._clean_entities(parties, min_len=3)
    
    def extract_locations(self, text: str) -> List[str]:
        """Extract location references."""
        locations = []
        for pattern in self.LOCATION_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            locations.extend(matches)
        return self._clean_entities(locations, min_len=3)