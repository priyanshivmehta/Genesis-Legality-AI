# intelligence/contract_analyzer.py
"""
Enhanced Contract Analyzer with Playbook Support and perspective/context handling
"""

from typing import Dict, List, Optional, Callable
import sys
import os

# --------------------------------------------------
# Path setup (kept from your original file)
# --------------------------------------------------
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from classification.clause_classifier import ClauseClassifier
from ner.entity_extractor import EntityExtractor
from risk.risk_engine import RiskEngine
from explainability.explainer import RiskExplainer


class ContractAnalyzer:
    """
    AI intelligence system with playbook-driven, perspective-aware risk analysis.
    """

    def __init__(
        self,
        playbook_path: Optional[str] = None,
        llm_client: Optional[Callable[[str], str]] = None,
        tone: str = "default",
    ):
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
        """

        # ---- GUARDRAIL ----
        if not clauses:
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
                        "Manual legal review is strongly recommended.",
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

        # ---- ENRICH CLAUSES ----
        enriched_clauses = []
        for clause in clauses:
            text = clause.get("text", "")
            title = clause.get("title", "")

            types_info = self.classifier.classify_types(text, title)
            entities = self.extractor.extract_all(text)

            enriched_clauses.append(
                {
                    **clause,
                    "types": types_info["types"],
                    "primary_type": types_info["primary_type"],
                    "secondary_types": types_info["secondary_types"],
                    "entities": entities,
                }
            )

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


# ==================================================
# ✅ FASTAPI ENTRY FUNCTION (THIS FIXES EVERYTHING)
# ==================================================
# backend/backend/Risk_logic/intelligence/contract_analyzer.py
# Update the analyze_contract function at the end of the file (line 176+)

def analyze_contract(file_path: str, perspective: str) -> Dict:
    """
    Thin wrapper used by FastAPI.
    Handles document ingestion, segmentation, and analysis.
    """
    from ingestion.input_handler import ingest_contract
    from segmentation.clause_splitter import segment_clauses
    
    # Step 1: Ingest and extract text
    print(f"📄 Ingesting contract from: {file_path}")
    ingestion_result = ingest_contract(file_path=file_path)
    
    # Check if ingestion failed
    if not ingestion_result.get("success", True):
        print("❌ Text extraction failed")
        return {
            "status": "PARSE_FAILED",
            "message": "Unable to extract readable text from the uploaded document. The file may be scanned without OCR, corrupted, or in an unsupported format.",
            "schema_version": "1.0",
            "context": {"contract_type": None, "perspective": perspective},
            "clauses": [],
            "risk_analysis": {
                "overall_risk": "UNKNOWN",
                "total_clauses": 0,
                "high_risk_clauses": 0,
                "medium_risk_clauses": 0,
                "low_risk_clauses": 0,
                "clause_analyses": [],
                "all_flagged_rules": [],
                "context": {"contract_type": None, "perspective": perspective},
            },
            "explanations": {
                "overall_risk_level": "UNKNOWN",
                "executive_summary": "⚠️ Unable to extract text from the document.",
                "contract_summary": "Text extraction failed. Please ensure the document is readable and not corrupted.",
                "statistics": {
                    "total_clauses": 0,
                    "high_risk": 0,
                    "medium_risk": 0,
                    "low_risk": 0,
                    "total_issues": 0,
                },
                "risky_clauses": [],
                "overall_recommendations": [
                    "The document could not be read automatically.",
                    "This may indicate a scanned document without text layer, corruption, or unsupported format.",
                    "Please try converting the document to a text-readable PDF or DOCX format.",
                    "Manual legal review is required.",
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
                    "context": {"contract_type": None, "perspective": perspective},
                },
            },
        }
    
    extracted_text = ingestion_result["text"]
    print(f"✓ Extracted {len(extracted_text)} characters")
    
    # Step 2: Segment into clauses
    print("✂️  Segmenting clauses...")
    clauses = segment_clauses(extracted_text)
    print(f"✓ Identified {len(clauses)} clauses")
    
    # Step 3: Analyze with ContractAnalyzer
    analyzer = ContractAnalyzer()
    result = analyzer.analyze_contract(
        clauses=clauses,
        contract_type=None,
        perspective=perspective,
    )
    
    # Add success status if not already present
    if "status" not in result:
        result["status"] = "SUCCESS"
    
    return result