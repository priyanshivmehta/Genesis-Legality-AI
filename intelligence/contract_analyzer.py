# intelligence/contract_analyzer.py
"""
Enhanced Contract Analyzer with Playbook Support and perspective/context handling
"""

from typing import Dict, List, Optional, Callable
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from classification.clause_classifier import ClauseClassifier
from ner.entity_extractor import EntityExtractor
from risk.risk_engine import RiskEngine
from explainability.explainer import RiskExplainer


class ContractAnalyzer:
    """
    AI intelligence system with playbook-driven, perspective-aware risk analysis.
    """

    def __init__(self, playbook_path: Optional[str] = None, llm_client: Optional[Callable[[str], str]] = None, tone: str = "default"):
        self.classifier = ClauseClassifier()
        self.extractor = EntityExtractor()
        self.risk_engine = RiskEngine(playbook_path=playbook_path)
        self.explainer = RiskExplainer(llm_client=llm_client, tone=tone)

    def analyze_contract(
        self,
        clauses: List[Dict],
        contract_type: Optional[str] = None,
        perspective: Optional[str] = None,
    ) -> Dict:
        """
        Complete contract analysis pipeline.
        
        Raises:
            ValueError: If clause parsing failed
        """
        # CRITICAL GUARDRAIL: Never pretend analysis succeeded when parsing failed
        if not clauses or len(clauses) == 0:
            return {
                "status": "PARSE_FAILED",
                "message": "Unable to reliably parse contract clauses. Please review manually.",
                "schema_version": "1.0",
                "context": {"contract_type": contract_type, "perspective": perspective},
                "clauses": [],
                "risk_analysis": {
                    "overall_risk": "UNKNOWN",
                    "total_clauses": 0,
                    "high_risk_clauses": 0,
                    "medium_risk_clauses": 0,
                    "low_risk_clauses": 0,
                    "clause_analyses": [],
                    "all_flagged_rules": [],
                    "context": {"contract_type": contract_type, "perspective": perspective},
                },
                "explanations": {
                    "overall_risk_level": "UNKNOWN",
                    "executive_summary": "⚠️ Contract parsing failed. Manual review required.",
                    "statistics": {
                        "total_clauses": 0,
                        "high_risk": 0,
                        "medium_risk": 0,
                        "low_risk": 0,
                        "total_issues": 0,
                    },
                    "risky_clauses": [],
                    "overall_recommendations": [
                        "Contract structure could not be parsed automatically.",
                        "This may indicate an unusual format or OCR issues.",
                        "Manual legal review is strongly recommended."
                    ],
                    "suggested_redlines": [],
                    "example_clauses": [],
                },
                "summary": {
                    "total_clauses": 0,
                    "clause_type_breakdown": {},
                    "contract_entities": {
                        "money": [],
                        "dates": [],
                        "durations": [],
                        "parties": [],
                        "locations": [],
                    },
                    "risk_summary": {
                        "overall_risk": "UNKNOWN",
                        "high_risk_count": 0,
                        "medium_risk_count": 0,
                        "total_issues": 0,
                        "context": {"contract_type": contract_type, "perspective": perspective},
                    },
                },
            }
        
        enriched_clauses = []
        for clause in clauses:
            text = clause.get("text", "")
            title = clause.get("title", "")

            types_info = self.classifier.classify_types(text, title)
            entities = self.extractor.extract_all(text)

            enriched_clause = {
                **clause,
                "types": types_info["types"],
                "primary_type": types_info["primary_type"],
                "secondary_types": types_info["secondary_types"],
                "entities": entities,
            }
            enriched_clauses.append(enriched_clause)

        risk_analysis = self.risk_engine.analyze_contract(
            enriched_clauses,
            contract_type=contract_type,
            perspective=perspective,
        )

        explanations = self.explainer.explain_contract_risk(
            risk_analysis,
            enriched_clauses,
            context={"contract_type": contract_type, "perspective": perspective},
        )

        return {
            "schema_version": "1.0",
            "context": {"contract_type": contract_type, "perspective": perspective},
            "clauses": enriched_clauses,
            "risk_analysis": risk_analysis,
            "explanations": explanations,
            "summary": self._generate_summary(enriched_clauses, risk_analysis),
        }

    def _generate_summary(self, clauses: List[Dict], risk_analysis: Dict) -> Dict:
        type_counts = {}
        for clause in clauses:
            primary = clause.get("primary_type", "GENERAL")
            type_counts[primary] = type_counts.get(primary, 0) + 1

        all_entities = {"money": [], "dates": [], "durations": [], "parties": [], "locations": []}
        for clause in clauses:
            entities = clause.get("entities", {})
            for key in all_entities:
                all_entities[key].extend(entities.get(key, []))

        for key in all_entities:
            all_entities[key] = list(set(all_entities[key]))

        return {
            "total_clauses": len(clauses),
            "clause_type_breakdown": type_counts,
            "contract_entities": all_entities,
            "risk_summary": {
                "overall_risk": risk_analysis["overall_risk"],
                "high_risk_count": risk_analysis["high_risk_clauses"],
                "medium_risk_count": risk_analysis["medium_risk_clauses"],
                "total_issues": len(risk_analysis.get("all_flagged_rules", [])),
                "context": risk_analysis.get("context", {}),
            },
        }