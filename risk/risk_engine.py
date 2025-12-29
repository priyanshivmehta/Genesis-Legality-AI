# risk/risk_engine.py
"""
Perspective-aware Risk Analysis Engine with Playbook Support
Evaluates contract clauses for legal risks with customizable, rule-based logic.
"""

from typing import Dict, List, Optional
import re
import json
import os


class RiskRule:
    """Represents a single risk detection rule with optional scoping and perspective-based risk levels."""
    def __init__(
        self,
        rule_id: str,
        name: str,
        clause_types: List[str],
        patterns: List[str],
        risk_level: str,
        description: str,
        why_risky: str,
        recommendation: str,
        redline_suggestion: Optional[str] = None,
        example_clauses: Optional[List[str]] = None,
        contract_types: Optional[List[str]] = None,
        perspectives: Optional[List[str]] = None,
        perspective_risk_levels: Optional[Dict[str, str]] = None,
        perspective_descriptions: Optional[Dict[str, str]] = None,
    ):
        self.rule_id = rule_id
        self.name = name
        self.clause_types = clause_types
        self.patterns = [re.compile(p, re.IGNORECASE) for p in patterns]
        self.risk_level = risk_level  # Default risk level
        self.perspective_risk_levels = perspective_risk_levels or {}
        self.perspective_descriptions = perspective_descriptions or {}
        self.description = description
        self.why_risky = why_risky
        self.recommendation = recommendation
        self.redline_suggestion = redline_suggestion
        self.example_clauses = example_clauses or []
        self.contract_types = [c.lower() for c in contract_types] if contract_types else []
        self.perspectives = [p.lower() for p in perspectives] if perspectives else []

    def get_risk_level(self, perspective: Optional[str] = None) -> str:
        """Get risk level, adjusted for perspective if applicable."""
        if perspective and perspective.lower() in self.perspective_risk_levels:
            return self.perspective_risk_levels[perspective.lower()]
        return self.risk_level
    
    def get_description(self, perspective: Optional[str] = None) -> str:
        """Get description, customized for perspective if applicable."""
        if perspective and perspective.lower() in self.perspective_descriptions:
            return self.perspective_descriptions[perspective.lower()]
        return self.description

    def matches(
        self,
        text: str,
        clause_types: List[str],
        contract_type: Optional[str],
        perspective: Optional[str],
    ) -> bool:
        # Scope by clause type
        if self.clause_types and not any(ct in clause_types for ct in self.clause_types):
            return False

        # Scope by contract type if specified
        if self.contract_types:
            if not contract_type or contract_type.lower() not in self.contract_types:
                return False

        # Scope by perspective if specified
        if self.perspectives:
            if not perspective or perspective.lower() not in self.perspectives:
                return False

        # Pattern match
        for pattern in self.patterns:
            if pattern.search(text):
                return True
        return False


class RiskEngine:
    """
    Risk analysis engine with JSON-based playbook support and perspective-aware rules.
    """

    def __init__(self, playbook_path: Optional[str] = None):
        self.rules = self._load_default_rules()
        if playbook_path and os.path.exists(playbook_path):
            self.load_playbook(playbook_path)

    def _load_default_rules(self) -> List[RiskRule]:
        """Load default risk detection rules with perspective-aware risk levels."""
        return [
            # INDEMNITY
            RiskRule(
                rule_id="IND001",
                name="Unlimited Indemnification",
                clause_types=["INDEMNITY"],
                patterns=[r"\bundimited\b.*\bindemnif", r"\bindemnif.*\bwithout.*limit\b", r"\bto\s+the\s+fullest\s+extent"],
                risk_level="HIGH",
                description="Unlimited indemnification obligation",
                why_risky="This could expose you to bankruptcy-level financial liability if something goes wrong.",
                recommendation="Negotiate a cap on indemnification (e.g., limited to contract value or specific dollar amount).",
                redline_suggestion="Add: 'provided that the aggregate liability for indemnification shall not exceed the total fees paid under this Agreement.'",
            ),
            RiskRule(
                rule_id="IND002",
                name="Broad Indemnification Scope",
                clause_types=["INDEMNITY"],
                patterns=[r"\bindemnif.*\ball\b.*\bclaims\b", r"\bdefend.*against\s+any", r"\bindemnif.*\bany\s+and\s+all\b"],
                risk_level="HIGH",
                description="Broad indemnification scope covering all claims",
                why_risky="You could be responsible even for issues outside your control or caused by the other party.",
                recommendation="Limit indemnification to claims arising solely from your negligence, willful misconduct, or breach of contract.",
                redline_suggestion="Replace 'all claims' with: 'claims arising solely from the indemnifying party's negligence or breach of this Agreement.'",
            ),
            RiskRule(
                rule_id="IND003",
                name="Attorney Fees Included",
                clause_types=["INDEMNITY"],
                patterns=[r"\bincluding.*attorney.*fees\b", r"\battorney.*fees.*and.*costs\b", r"\blegal.*fees.*expenses\b"],
                risk_level="MEDIUM",
                description="Indemnification includes attorney fees",
                why_risky="Legal defense costs can exceed actual damages, significantly increasing your financial exposure.",
                recommendation="Request mutual attorney fee provisions or cap on legal costs.",
                redline_suggestion="Add: 'reasonable attorney fees, not to exceed $[amount].'",
            ),

            # TERMINATION - WITH PERSPECTIVE-BASED RISK LEVELS
            RiskRule(
                rule_id="TERM001",
                name="At-Will Termination",
                clause_types=["TERMINATION"],
                patterns=[r"\bterminate.*at.*any.*time\b", r"\btermination.*without.*cause\b", r"\bat.*will\b", r"\bfor.*any.*reason.*or.*no.*reason\b"],
                risk_level="HIGH",  # Default
                perspective_risk_levels={
                    "employee": "HIGH",
                    "employer": "LOW",
                    "receiver": "MEDIUM",
                    "discloser": "MEDIUM",
                    "vendor": "HIGH",
                    "client": "LOW",
                },
                perspective_descriptions={
                    "employee": "Your employer can fire you at any time without cause, leaving you with no job security.",
                    "employer": "You can terminate employment flexibly when needed, which provides management discretion.",
                    "receiver": "The disclosing party can terminate at-will, potentially cutting off your access to needed information.",
                    "vendor": "The client can end the contract anytime, leaving you with no revenue guarantee.",
                    "client": "You maintain flexibility to end the vendor relationship if needed.",
                },
                description="Termination at-will without cause",
                why_risky="The other party can end the contract anytime without reason, leaving you with no guarantee of contract duration or ROI.",
                recommendation="Require written notice period (e.g., 30-90 days) or limit termination to 'for cause' only.",
                redline_suggestion="Replace with: 'Either party may terminate this Agreement for cause upon 30 days written notice, or for convenience upon 90 days written notice.'",
            ),
            RiskRule(
                rule_id="TERM002",
                name="Immediate Termination",
                clause_types=["TERMINATION"],
                patterns=[r"\bimmediate.*termination\b", r"\bterminate.*immediately\b", r"\beffective.*immediately\b"],
                risk_level="MEDIUM",
                description="Immediate termination without notice period",
                why_risky="No time to transition, recover costs, or find alternatives.",
                recommendation="Negotiate a minimum notice period except for material breach.",
                redline_suggestion="Add: 'except in cases of material breach, either party shall provide [30] days written notice before termination.'",
            ),
            RiskRule(
                rule_id="TERM003",
                name="No Refund on Termination",
                clause_types=["TERMINATION", "PAYMENT"],
                patterns=[r"\bno.*refund\b", r"\bnon-refundable\b", r"\ball.*fees.*are.*final\b"],
                risk_level="HIGH",
                perspective_risk_levels={
                    "client": "HIGH",
                    "vendor": "LOW",
                    "employee": "MEDIUM",
                    "employer": "LOW",
                },
                description="No refund upon early termination",
                why_risky="You lose all invested money if the relationship doesn't work out, even if services aren't fully delivered.",
                recommendation="Negotiate pro-rata refunds for unused services or time periods.",
                redline_suggestion="Add: 'In the event of early termination, fees for services not yet rendered shall be refunded on a pro-rata basis.'",
            ),

            # LIABILITY
            RiskRule(
                rule_id="LIAB001",
                name="Unlimited Liability",
                clause_types=["LIABILITY"],
                patterns=[r"\bunlimited.*liability\b", r"\bno.*cap.*on.*liability\b", r"\bliable.*for.*all\b"],
                risk_level="HIGH",
                description="Unlimited liability exposure",
                why_risky="A single incident could result in catastrophic financial loss with no upper bound.",
                recommendation="Insist on a liability cap (typically 1-2x annual contract fees or specific dollar amount).",
                redline_suggestion="Add: 'Except for gross negligence or willful misconduct, each party's total liability shall not exceed the greater of (i) the fees paid in the 12 months preceding the claim or (ii) $[amount].'",
            ),
            RiskRule(
                rule_id="LIAB002",
                name="Consequential Damages Allowed",
                clause_types=["LIABILITY"],
                patterns=[r"\bconsequential.*damages\b", r"\bindirect.*damages\b", r"\bincidental.*damages\b", r"\blost.*profits?\b"],
                risk_level="HIGH",
                description="Consequential or indirect damages not excluded",
                why_risky="These damages (lost profits, business interruption) can far exceed the contract value and are hard to predict or control.",
                recommendation="Add mutual exclusion of consequential, indirect, and punitive damages.",
                redline_suggestion="Add: 'IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR CONSEQUENTIAL, INDIRECT, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, OR LOST PROFITS.'",
            ),
            RiskRule(
                rule_id="LIAB003",
                name="Punitive Damages",
                clause_types=["LIABILITY"],
                patterns=[r"\bpunitive.*damages\b", r"\bexemplary.*damages\b"],
                risk_level="HIGH",
                description="Punitive damages allowed",
                why_risky="Punitive damages are designed to punish and can be many times actual damages.",
                recommendation="Explicitly exclude punitive damages for both parties.",
                redline_suggestion="Add: 'Neither party shall be liable for punitive or exemplary damages.'",
            ),

            # PAYMENT
            RiskRule(
                rule_id="PAY001",
                name="Automatic Renewal",
                clause_types=["PAYMENT", "TERMINATION"],
                patterns=[r"\bautomatic.*renewal\b", r"\bautomatically.*renew\b", r"\brenews.*automatically\b"],
                risk_level="MEDIUM",
                description="Automatic renewal clause",
                why_risky="Easy to miss the cancellation deadline and get locked into another term with financial obligations.",
                recommendation="Request opt-in renewal instead, or ensure you have clear calendar reminders for the cancellation window.",
                redline_suggestion="Replace with: 'This Agreement shall expire at the end of the term unless both parties agree in writing to renew.'",
            ),
            RiskRule(
                rule_id="PAY002",
                name="Large Upfront Payment",
                clause_types=["PAYMENT"],
                patterns=[r"\bpayment.*in.*advance\b.*\bone.*year\b", r"\bfull.*payment.*upon.*execution\b", r"\bentire.*fee.*upfront\b"],
                risk_level="MEDIUM",
                perspective_risk_levels={
                    "client": "HIGH",
                    "vendor": "LOW",
                },
                description="Large upfront payment required",
                why_risky="Significant financial risk if vendor fails to perform or relationship doesn't work out.",
                recommendation="Negotiate milestone-based payments or monthly/quarterly billing.",
                redline_suggestion="Replace with: 'Fees shall be paid quarterly in advance' or 'Fees shall be paid upon completion of defined milestones.'",
            ),

            # CONFIDENTIALITY - WITH PERSPECTIVE-BASED RISK
            RiskRule(
                rule_id="CONF001",
                name="Perpetual Confidentiality",
                clause_types=["CONFIDENTIALITY"],
                patterns=[r"\bperpetual.*confidentiality\b", r"\bconfidential.*in.*perpetuity\b", r"\bconfidential.*indefinitely\b", r"\bno\s+longer\s+qualifies\s+as\s+a\s+trade\s+secret"],
                risk_level="HIGH",
                perspective_risk_levels={
                    "receiver": "HIGH",
                    "discloser": "LOW",
                },
                perspective_descriptions={
                    "receiver": "You're bound forever to keep their secrets, creating indefinite legal obligations.",
                    "discloser": "Your confidential information is protected indefinitely, which provides strong ongoing protection.",
                },
                description="Perpetual or indefinite confidentiality obligation",
                why_risky="Unreasonably burdensome and may conflict with future obligations. Industry standard is 3-5 years.",
                recommendation="Limit confidentiality term to 3-5 years from disclosure date, with exceptions for true trade secrets.",
                redline_suggestion="Replace with: 'The confidentiality obligations shall remain in effect for [3-5] years from the date of disclosure, except for information that qualifies as a trade secret under applicable law.'",
            ),
            RiskRule(
                rule_id="CONF002",
                name="Overly Broad Definition",
                clause_types=["CONFIDENTIALITY"],
                patterns=[r"\ball.*information.*confidential\b", r"\bany.*information.*disclosed\b", r"\ball.*information.*or.*material\b"],
                risk_level="HIGH",
                perspective_risk_levels={
                    "receiver": "HIGH",
                    "discloser": "LOW",
                },
                description="Overly broad definition of confidential information",
                why_risky="Everything you see or hear could be deemed confidential, creating impossible compliance burdens.",
                recommendation="Ensure clear exclusions for publicly available information, independently developed information, and information received from third parties.",
                redline_suggestion="Add: 'Confidential Information does not include information that: (i) is publicly available; (ii) was known prior to disclosure; (iii) is independently developed; or (iv) is received from a third party without breach.'",
            ),

            # IP - WITH PERSPECTIVE-BASED RISK
            RiskRule(
                rule_id="IP001",
                name="Complete IP Assignment",
                clause_types=["INTELLECTUAL_PROPERTY"],
                patterns=[r"\ball.*rights.*assigned\b", r"\bcompletely.*assign\b", r"\bassign.*all.*intellectual.*property\b"],
                risk_level="HIGH",
                perspective_risk_levels={
                    "employee": "HIGH",
                    "employer": "LOW",
                    "vendor": "HIGH",
                    "client": "LOW",
                },
                perspective_descriptions={
                    "employee": "You lose all rights to your work and can't reuse your skills or tools elsewhere.",
                    "employer": "You gain full ownership of all work product created during employment.",
                    "vendor": "You can't reuse your own tools, frameworks, or general methodologies.",
                    "client": "You receive full ownership of all deliverables and related IP.",
                },
                description="Complete intellectual property assignment",
                why_risky="You lose all rights to your work and cannot reuse general skills, tools, or methodologies in future projects.",
                recommendation="Negotiate to retain rights to pre-existing IP, general skills, and reusable tools/frameworks.",
                redline_suggestion="Add: 'This assignment excludes: (i) pre-existing intellectual property; (ii) general skills and knowledge; and (iii) tools and frameworks of general applicability.'",
            ),
            RiskRule(
                rule_id="IP002",
                name="Work for Hire",
                clause_types=["INTELLECTUAL_PROPERTY"],
                patterns=[r"\bwork.*for.*hire\b", r"\bwork-for-hire\b"],
                risk_level="MEDIUM",
                perspective_risk_levels={
                    "employee": "MEDIUM",
                    "employer": "LOW",
                    "vendor": "MEDIUM",
                    "client": "LOW",
                },
                description="Work-for-hire provision",
                why_risky="All work automatically belongs to the other party with no retained rights.",
                recommendation="Clarify scope of work-for-hire and ensure you retain rights to pre-existing materials and general tools.",
                redline_suggestion="Add: 'Work for hire applies only to custom deliverables specifically created for this project, excluding pre-existing materials and general-purpose tools.'",
            ),

            # NON-COMPETE - WITH PERSPECTIVE-BASED RISK
            RiskRule(
                rule_id="NONC001",
                name="Broad Non-Compete",
                clause_types=["NON_COMPETE"],
                patterns=[r"\bnon-compete.*\d+\s*years?\b", r"\bany.*jurisdiction\b", r"\bany.*industry\b"],
                risk_level="HIGH",
                perspective_risk_levels={
                    "employee": "HIGH",
                    "employer": "LOW",
                },
                perspective_descriptions={
                    "employee": "This significantly restricts where you can work and earn income after leaving.",
                    "employer": "This protects your business interests from employee competition.",
                },
                description="Overly broad non-compete restriction",
                why_risky="Significantly limits your future employment and income opportunities.",
                recommendation="Negotiate shorter duration (6-12 months), narrow geographic scope, and specific industry limitations.",
                redline_suggestion="Revise to: 'For [6-12] months following termination, and only within [specific geographic area], Employee shall not compete directly in [specific narrow business line].'",
            ),

            # WARRANTY
            RiskRule(
                rule_id="WAR001",
                name="No Warranty/As-Is",
                clause_types=["WARRANTY"],
                patterns=[r"\bno.*warranty\b", r"\bas\s+is\b", r"\bas-is\b", r"\bdisclaimer.*all.*warranties\b"],
                risk_level="MEDIUM",
                perspective_risk_levels={
                    "client": "HIGH",
                    "vendor": "LOW",
                },
                description="No warranty or as-is provision",
                why_risky="You have no recourse if deliverables are defective, inadequate, or don't work as expected.",
                recommendation="Request basic warranties for merchantability, fitness for purpose, and workmanlike performance.",
                redline_suggestion="Add: 'Provider warrants that services will be performed in a professional and workmanlike manner and deliverables will conform to specifications for a period of [90] days.'",
            ),
            
            # UNILATERAL TERMINATION (services/employment)
            RiskRule(
                rule_id="TERM004",
                name="Unilateral Termination Right",
                clause_types=["TERMINATION"],
                patterns=[
                    r"\b(?:company|employer|service\s+provider)\s+may\s+terminate\b.*\bfor\s+(?:any|no)\s+reason\b",
                    r"\b(?:company|employer|provider)\b.*\bsole\s+discretion\b.*\bterminate\b",
                ],
                risk_level="HIGH",
                description="Only one party can terminate without cause",
                why_risky="Creates one-sided exit leverage; you have no parallel right.",
                recommendation="Require mutual termination rights with notice or limit to for-cause only.",
                redline_suggestion="Add: 'Either party may terminate for convenience with 90 days notice.'",
                contract_types=["services", "employment"],
            ),

            # MISSING CONFIDENTIALITY DURATION (NDA/services)
            RiskRule(
                rule_id="CONF003",
                name="No Confidentiality Sunset",
                clause_types=["CONFIDENTIALITY"],
                patterns=[
                    r"(?i)\bconfidential\b(?!.{0,200}\b\d+\s*(?:year|month)s?\b)",
                ],
                risk_level="MEDIUM",
                perspective_risk_levels={
                    "receiver": "MEDIUM",
                    "discloser": "LOW",
                },
                description="Confidentiality term lacks explicit duration",
                why_risky="Obligations may be read as perpetual, creating indefinite burden.",
                recommendation="Add a 3–5 year confidentiality term with trade-secret carve-out.",
                redline_suggestion="Add: 'for a period of three (3) years from disclosure, except for trade secrets.'",
                contract_types=["nda", "services"],
            ),

            # HOME-COURT GOVERNING LAW (all types)
            RiskRule(
                rule_id="LAW001",
                name="Exclusive Home-Court Venue",
                clause_types=["GOVERNING_LAW"],
                patterns=[
                    r"\bexclusive\s+(?:jurisdiction|venue)\b",
                    r"\bsubmit\s+to\s+the\s+exclusive\s+jurisdiction\b",
                ],
                risk_level="MEDIUM",
                description="Exclusive venue or jurisdiction favors counterparty",
                why_risky="Increases cost and risk of litigating away from your home forum.",
                recommendation="Negotiate neutral venue or mutual forum selection.",
                redline_suggestion="Replace with: 'non-exclusive jurisdiction' or add mutual venue clause.",
                contract_types=["nda", "services", "employment"],
            ),

            # OVERBROAD EMPLOYMENT NON-COMPETE
            RiskRule(
                rule_id="NONC002",
                name="Employment Non-Compete Overreach",
                clause_types=["NON_COMPETE"],
                patterns=[
                    r"\b(?:18|24|thirty-six)\s*months?\b",
                    r"\bany\s+(?:capacity|role|industry)\b",
                    r"\bnationwide\b",
                ],
                risk_level="HIGH",
                perspective_risk_levels={
                    "employee": "HIGH",
                    "employer": "LOW",
                },
                description="Non-compete is long in duration or overbroad in scope",
                why_risky="Materially restricts post-employment work options; may be unenforceable but still burdensome.",
                recommendation="Reduce to 6–12 months, narrow geography and make role-specific.",
                redline_suggestion="Limit to: '6 months, within 50-mile radius, in direct competing role only.'",
                contract_types=["employment"],
            ),

            # NO DISPUTE RESOLUTION MECHANISM
            RiskRule(
                rule_id="DISP001",
                name="No Dispute Resolution Mechanism",
                clause_types=["DISPUTE_RESOLUTION", "GENERAL"],
                patterns=[
                    r"(?i)\bdispute\b(?!.{0,100}\b(?:arbitration|mediation|negotiation)\b)",
                ],
                risk_level="MEDIUM",
                description="Contract references disputes but lacks resolution process",
                why_risky="Defaults to costly, unmanaged litigation without structured escalation.",
                recommendation="Add negotiation → mediation → arbitration/venue sequence with timelines.",
                redline_suggestion="Add: 'Parties shall first negotiate in good faith for 30 days, then proceed to mediation.'",
                contract_types=["nda", "services", "employment"],
            ),
        ]

    def load_playbook(self, playbook_path: str):
        """Load additional rules from JSON playbook file."""
        with open(playbook_path, "r") as f:
            playbook = json.load(f)

        for rule_data in playbook.get("rules", []):
            rule = RiskRule(
                rule_id=rule_data["ruleId"],
                name=rule_data["name"],
                clause_types=rule_data.get("clauseTypes", []),
                patterns=rule_data["patterns"],
                risk_level=rule_data["riskLevel"],
                description=rule_data["description"],
                why_risky=rule_data["whyRisky"],
                recommendation=rule_data["recommendation"],
                redline_suggestion=rule_data.get("redlineSuggestion"),
                example_clauses=rule_data.get("exampleClauses"),
                contract_types=rule_data.get("contractTypes"),
                perspectives=rule_data.get("perspectives"),
                perspective_risk_levels=rule_data.get("perspectiveRiskLevels"),
                perspective_descriptions=rule_data.get("perspectiveDescriptions"),
            )
            self.rules.append(rule)

    def analyze_clause(
        self,
        clause: Dict,
        contract_type: Optional[str] = None,
        perspective: Optional[str] = None,
    ) -> Dict:
        """
        Analyze a single clause against all rules, honoring contract_type and perspective.
        """
        text = clause.get("text", "")
        clause_types = clause.get("types", ["GENERAL"])

        matched_rules = []

        for rule in self.rules:
            if rule.matches(text, clause_types, contract_type, perspective):
                # Use perspective-aware risk level and description
                adjusted_risk = rule.get_risk_level(perspective)
                adjusted_description = rule.get_description(perspective)
                
                matched_rules.append(
                    {
                        "rule_id": rule.rule_id,
                        "name": rule.name,
                        "risk_level": adjusted_risk,
                        "description": adjusted_description,
                        "why_risky": rule.why_risky,
                        "recommendation": rule.recommendation,
                        "redline_suggestion": rule.redline_suggestion,
                        "example_clauses": rule.example_clauses,
                        "contract_scope": rule.contract_types,
                        "perspective_scope": rule.perspectives,
                    }
                )

        risk_levels = [r["risk_level"] for r in matched_rules]
        if "HIGH" in risk_levels:
            overall_risk = "HIGH"
        elif "MEDIUM" in risk_levels:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        return {
            "clause_id": clause.get("id"),
            "clause_title": clause.get("title"),
            "risk_level": overall_risk,
            "matched_rules": matched_rules,
            "risk_count": len(matched_rules),
        }

    def analyze_contract(
        self,
        clauses: List[Dict],
        contract_type: Optional[str] = None,
        perspective: Optional[str] = None,
    ) -> Dict:
        """Analyze entire contract with context."""
        results = []
        high_risk_count = 0
        medium_risk_count = 0
        low_risk_count = 0
        all_matched_rules = []

        for clause in clauses:
            risk_analysis = self.analyze_clause(clause, contract_type, perspective)
            results.append(risk_analysis)

            if risk_analysis["risk_level"] == "HIGH":
                high_risk_count += 1
            elif risk_analysis["risk_level"] == "MEDIUM":
                medium_risk_count += 1
            else:
                low_risk_count += 1

            all_matched_rules.extend(risk_analysis["matched_rules"])

        if high_risk_count >= 3:
            overall_risk = "HIGH"
        elif high_risk_count >= 1 or medium_risk_count >= 5:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        return {
            "overall_risk": overall_risk,
            "total_clauses": len(clauses),
            "high_risk_clauses": high_risk_count,
            "medium_risk_clauses": medium_risk_count,
            "low_risk_clauses": low_risk_count,
            "clause_analyses": results,
            "all_flagged_rules": all_matched_rules,
            "context": {
                "contract_type": contract_type,
                "perspective": perspective,
            },
        }