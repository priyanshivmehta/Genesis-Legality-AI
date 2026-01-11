"""
Explainability Layer
Generates plain-English explanations with redline suggestions and examples.

CRITICAL ARCHITECTURE:
- Rules return StructuredRiskObject with signals (boolean facts)
- LLMResponseHandler calls OpenAI with fact-driven prompts
- LLM explains detected facts, does NOT invent risks
- Fallback to rule defaults if LLM unavailable
- Never use LLM for legal decisions, only explanations
"""

from typing import Callable, Dict, List, Optional
from explainability.llm_handler import LLMResponseHandler


class RiskExplainer:
    RISK_LEVEL_SUMMARY = {
        "HIGH": (
            "⚠️ **HIGH RISK** - This contract contains serious issues that could expose "
            "you to significant legal or financial harm. Legal review strongly recommended."
        ),
        "MEDIUM": (
            "⚡ **MEDIUM RISK** - This contract has some concerning terms that should be "
            "reviewed and potentially negotiated. Consider consulting a lawyer."
        ),
        "LOW": (
            "✓ **LOW RISK** - This contract appears relatively balanced with no major "
            "red flags. Standard review recommended."
        ),
    }
    
    # Perspective-specific explanation frames
    PERSPECTIVE_FRAMES = {
        "TERM001": {
            "employee": {
                "what_it_means": "Your employer can fire you at any time, for any reason or no reason at all, without advance notice.",
                "why_risky": "You have zero job security. Even if you're performing well, you could be terminated tomorrow with no recourse.",
            },
            "employer": {
                "what_it_means": "You can terminate employment at your discretion without being locked into a specific commitment.",
                "why_risky": "While this gives you flexibility, it may make it harder to attract top talent who want stability.",
            },
            "receiver": {
                "what_it_means": "The disclosing party can end the NDA at any time, potentially cutting off your access to confidential information.",
                "why_risky": "If you're building a product or business based on their disclosed information, sudden termination could derail your plans.",
            },
            "vendor": {
                "what_it_means": "Your client can cancel the contract anytime without cause, ending your revenue stream.",
                "why_risky": "You can't count on the contract value for planning. All your investment in setup, training, and onboarding could be wasted.",
            },
        },
        "TERM003": {
            "client": {
                "what_it_means": "If you terminate early, you forfeit all prepaid fees even if services weren't delivered.",
                "why_risky": "If the vendor underperforms or you need to exit, you lose your entire investment with no recourse for recovery.",
            },
            "vendor": {
                "what_it_means": "You keep all fees even if the client terminates before completion.",
                "why_risky": "This is generally favorable to you, but aggressive terms may damage client relationships or lead to disputes.",
            },
        },
        "CONF001": {
            "receiver": {
                "what_it_means": "You must keep their secrets forever, with no expiration date.",
                "why_risky": "Decades from now, you could still be legally obligated to protect information that may be obsolete or public knowledge.",
            },
            "discloser": {
                "what_it_means": "Your confidential information is protected indefinitely.",
                "why_risky": "While this provides strong protection, overly aggressive terms may discourage partners from signing the NDA.",
            },
        },
        "IP001": {
            "employee": {
                "what_it_means": "Everything you create—code, designs, ideas—belongs to your employer, not you.",
                "why_risky": "You can't reuse your own work, tools, or methodologies in future jobs or side projects. Even things you built on your own time may be claimed.",
            },
            "employer": {
                "what_it_means": "You own all work product created by the employee during their tenure.",
                "why_risky": "This is standard for employers, but overly broad clauses can create enforcement issues or discourage talented hires.",
            },
            "vendor": {
                "what_it_means": "All code, tools, and frameworks you create for this project become the client's property.",
                "why_risky": "You can't reuse your own general-purpose utilities or methodologies in other client projects.",
            },
        },
        "NONC001": {
            "employee": {
                "what_it_means": "After leaving, you can't work in your field for [duration] in [geography].",
                "why_risky": "This could force you to change careers, relocate, or remain unemployed. Many non-competes are unenforceable, but fighting them is expensive.",
            },
            "employer": {
                "what_it_means": "Former employees cannot work for competitors or start competing businesses for a specified period.",
                "why_risky": "Overly broad non-competes are often unenforceable and can damage your reputation as an employer.",
            },
        },
        "WAR001": {
            "client": {
                "what_it_means": "The vendor provides no guarantees that deliverables will work or meet your needs.",
                "why_risky": "If the product is defective or doesn't work as expected, you have no contractual recourse. You pay full price for 'as-is' quality.",
            },
            "vendor": {
                "what_it_means": "You're not liable if deliverables don't meet client expectations.",
                "why_risky": "This protects you but may result in disputes and damaged relationships if clients feel misled.",
            },
        },
        "PAY002": {
            "client": {
                "what_it_means": "You must pay the entire contract value upfront before any work begins.",
                "why_risky": "If the vendor disappears, underperforms, or goes bankrupt, you've already paid and have limited recourse.",
            },
            "vendor": {
                "what_it_means": "You receive full payment upfront, improving your cash flow.",
                "why_risky": "Clients may resist large upfront payments, and you lose leverage if disputes arise during delivery.",
            },
        },
    }

    def __init__(
        self,
        llm_client: Optional[Callable[[str], str]] = None,
        tone: str = "default",
    ):
        self.llm_client = llm_client
        self.tone = tone
        # Use new LLM handler for fact-driven prompts and structured responses
        self.llm_handler = LLMResponseHandler(openai_client=llm_client)

    # ------------------------------------------------------------------
    # Get perspective-aware explanation
    # ------------------------------------------------------------------
    def _get_perspective_explanation(
        self, rule_id: str, field: str, perspective: Optional[str], default: str
    ) -> str:
        """Get perspective-specific explanation text if available."""
        if not perspective or rule_id not in self.PERSPECTIVE_FRAMES:
            return default
        
        rule_frames = self.PERSPECTIVE_FRAMES[rule_id]
        perspective_lower = perspective.lower()
        
        if perspective_lower in rule_frames:
            return rule_frames[perspective_lower].get(field, default)
        
        return default

    # ------------------------------------------------------------------
    # Clause-level explainability
    # ------------------------------------------------------------------
    def explain_clause_risk(
        self, clause_analysis: Dict, clause: Dict, context: Optional[Dict] = None
    ) -> Dict:
        """
        Explain risks in a clause using fact-driven LLM with fallback.
        
        CRITICAL: LLM receives StructuredRiskObject with signals (facts),
        not conclusions. LLM explains detected facts only.
        """
        risk_level = clause_analysis["risk_level"]
        matched_rules = clause_analysis.get("matched_rules", [])
        perspective = context.get("perspective") if context else None

        explanation = {
            "clause_id": clause.get("id"),
            "clause_title": clause.get("title"),
            "risk_level": risk_level,
            "summary": "",
            "issues": [],
            "recommendations": [],
            "redlines": [],
            "examples": [],
        }

        # Deterministic clause summary
        if risk_level == "HIGH":
            explanation["summary"] = (
                f"🚨 CRITICAL: This '{clause.get('title')}' clause contains HIGH RISK "
                "terms that require immediate attention."
            )
        elif risk_level == "MEDIUM":
            explanation["summary"] = (
                f"⚠️ WARNING: This '{clause.get('title')}' clause has MEDIUM RISK "
                "elements worth reviewing."
            )
        else:
            explanation["summary"] = (
                f"✓ This '{clause.get('title')}' clause appears standard with LOW RISK."
            )

        # Explain each triggered rule using fact-driven LLM
        for rule in matched_rules:
            rule_id = rule["rule_id"]
            
            # Extract StructuredRiskObject if available (new path)
            # Otherwise use dict (backwards compatible)
            if "_structured_object" in rule:
                structured_risk = rule["_structured_object"]
                if isinstance(structured_risk, dict):
                    structured_risk_dict = structured_risk
                else:
                    structured_risk_dict = structured_risk.to_dict()
            else:
                # Backwards compatibility: convert dict to structured form
                structured_risk_dict = {
                    "rule_id": rule.get("rule_id"),
                    "rule_name": rule.get("name", rule.get("rule_name")),
                    "risk_level": rule.get("risk_level"),
                    "legal_category": rule.get("contract_scope", ["GENERAL"])[0] if rule.get("contract_scope") else "GENERAL",
                    "signals": rule.get("signals", {}),
                    "clause_excerpt": rule.get("clause_excerpt", rule.get("matched_text", "")),
                    "description": rule.get("description"),
                    "why_risky": rule.get("why_risky"),
                    "recommendation": rule.get("recommendation"),
                    "redline_suggestion": rule.get("redline_suggestion"),
                }

            # Use fact-driven LLM to explain this risk
            llm_explanation = self.llm_handler.explain_risk_with_llm(
                structured_risk_dict, context
            )

            # Add issue explanation
            explanation["issues"].append(
                {
                    "rule_id": rule_id,
                    "severity": rule["risk_level"],
                    "issue": rule.get("description", "Risk detected"),
                    "summary": llm_explanation.get("summary", ""),
                    "why_risky": llm_explanation.get("why_risky", ""),
                    "what_triggers": llm_explanation.get("what_triggers", []),
                    "contract_scope": rule.get("contract_scope"),
                    "perspective_scope": rule.get("perspective_scope"),
                    "llm_source": llm_explanation.get("source", "fallback"),
                }
            )

            # Add recommendation
            explanation["recommendations"].append(
                {
                    "rule_id": rule_id,
                    "action": rule.get("recommendation", "Address this risk"),
                }
            )

            # Add redline suggestion
            if rule.get("redline_suggestion"):
                explanation["redlines"].append(
                    {
                        "rule_id": rule_id,
                        "suggestion": rule.get("redline_suggestion"),
                        "example_wording": llm_explanation.get("example_wording", rule.get("redline_suggestion")),
                        "type": "replacement",
                    }
                )

            # Add example clauses if available
            if rule.get("example_clauses"):
                explanation["examples"].extend(
                    {
                        "rule_id": rule_id,
                        "text": ex,
                    }
                    for ex in rule["example_clauses"]
                )

        return explanation


        return explanation

    # ------------------------------------------------------------------
    # Contract-level explainability
    # ------------------------------------------------------------------
    def explain_contract_risk(
        self,
        contract_analysis: Dict,
        clauses: List[Dict],
        context: Dict,
    ) -> Dict:
        """
        Explain overall contract risk using fact-driven LLM.
        """
        overall_risk = contract_analysis["overall_risk"]

        clause_explanations = []
        for clause_risk in contract_analysis["clause_analyses"]:
            if clause_risk["risk_level"] != "LOW":
                clause = next(
                    (c for c in clauses if c.get("id") == clause_risk["clause_id"]),
                    {},
                )
                clause_explanations.append(
                    self.explain_clause_risk(clause_risk, clause, context)
                )

        overall_recommendations = self._generate_overall_recommendations(
            contract_analysis, context
        )

        # Collect all redlines
        all_redlines = []
        for exp in clause_explanations:
            for redline in exp.get("redlines", []):
                all_redlines.append(
                    {
                        **redline,
                        "clause_id": exp["clause_id"],
                        "clause_title": exp["clause_title"],
                    }
                )

        # Collect all example clauses
        all_examples = []
        for exp in clause_explanations:
            for ex in exp.get("examples", []):
                all_examples.append(
                    {
                        **ex,
                        "clause_id": exp["clause_id"],
                        "clause_title": exp["clause_title"],
                    }
                )

        # Use LLM handler to create contract-level summary from detected rules
        high_risk_rules = contract_analysis.get("all_flagged_rules", [])
        high_risk_rules = [r for r in high_risk_rules if r.get("risk_level") == "HIGH"]
        
        medium_risk_rules = [r for r in contract_analysis.get("all_flagged_rules", [])
                            if r.get("risk_level") == "MEDIUM"]

        contract_summary = self.llm_handler.create_contract_summary_with_llm(
            high_risk_rules,
            medium_risk_rules,
            context,
        )

        return {
            "context": context,
            "overall_risk_level": overall_risk,
            "executive_summary": self.RISK_LEVEL_SUMMARY[overall_risk],
            "contract_summary": contract_summary,
            "statistics": {
                "total_clauses": contract_analysis["total_clauses"],
                "high_risk": contract_analysis["high_risk_clauses"],
                "medium_risk": contract_analysis["medium_risk_clauses"],
                "low_risk": contract_analysis["low_risk_clauses"],
                "total_issues": len(
                    contract_analysis.get("all_flagged_rules", [])
                ),
            },
            "risky_clauses": clause_explanations,
            "overall_recommendations": overall_recommendations,
            "suggested_redlines": all_redlines,
            "example_clauses": all_examples,
        }

    # ------------------------------------------------------------------
    # Deterministic overall recommendations
    # ------------------------------------------------------------------
    def _generate_overall_recommendations(
        self, contract_analysis: Dict, context: Dict
    ) -> List[str]:
        recommendations = []
        perspective = context.get("perspective", "").lower()

        high = contract_analysis["high_risk_clauses"]
        medium = contract_analysis["medium_risk_clauses"]

        if high >= 3:
            recommendations.append(
                "🔴 CRITICAL: Have a lawyer review this contract before signing."
            )
            recommendations.append(
                "Do not sign without negotiating the high-risk clauses identified."
            )
        elif high >= 1:
            recommendations.append(
                "⚠️ Strongly consider legal counsel to address high-risk terms."
            )

        if medium >= 5:
            recommendations.append(
                "Review and negotiate medium-risk clauses to improve overall terms."
            )

        # Perspective-specific recommendations
        if perspective in ["employee", "receiver", "vendor"]:
            recommendations.append(
                "Remember: the other party drafted this contract to favor their interests. "
                "It's normal and expected to negotiate changes."
            )
        elif perspective in ["employer", "discloser", "client"]:
            recommendations.append(
                "Consider whether these terms might discourage good candidates/partners from signing. "
                "Balance protection with fairness."
            )

        if contract_analysis["overall_risk"] == "HIGH":
            recommendations.append(
                "Consider requesting a complete contract revision with more balanced terms."
            )
        elif contract_analysis["overall_risk"] == "MEDIUM":
            recommendations.append(
                "Use the redline suggestions below as negotiation points."
            )
        else:
            recommendations.append(
                "Perform standard due diligence before signing."
            )

        recommendations.append(
            "Document all negotiated changes in writing before signing."
        )
        recommendations.append(
            "Consider requesting a side letter addressing the flagged issues."
        )

        return recommendations

    # ------------------------------------------------------------------
    # Redline document generator
    # ------------------------------------------------------------------
    def generate_redline_document(self, explanations: Dict) -> str:
        output = []
        output.append("=" * 80)
        output.append("CONTRACT REDLINE SUGGESTIONS")
        output.append("Generated by Legal Contract Risk Analyzer")
        
        context = explanations.get("context", {})
        if context.get("contract_type") or context.get("perspective"):
            output.append(
                f"Contract Type: {context.get('contract_type', 'N/A')} | "
                f"Perspective: {context.get('perspective', 'N/A')}"
            )
        
        output.append("=" * 80)
        output.append("")

        redlines = explanations.get("suggested_redlines", [])
        for i, redline in enumerate(redlines, 1):
            output.append(
                f"\n[{i}] CLAUSE {redline['clause_id']}: {redline['clause_title']}"
            )
            output.append(f"    Rule: {redline['rule_id']}")
            output.append(f"    Type: {redline['type'].upper()}")
            output.append("\n    SUGGESTED CHANGE:")
            output.append(f"    {redline['suggestion']}")
            if "example_wording" in redline:
                output.append(f"    {redline['example_wording']}")
            output.append("")

        if not redlines:
            output.append(
                "No redline suggestions — contract appears acceptable."
            )

        return "\n".join(output)