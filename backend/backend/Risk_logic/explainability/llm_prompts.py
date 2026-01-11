"""
Fact-Driven LLM Prompt Generation

This module generates OpenAI prompts that enforce the Rule → Facts → LLM pipeline.

CRITICAL: The LLM must ONLY explain detected facts, not invent new risks.
The prompt explicitly forbids assumptions and generic advice.
"""

from typing import Dict, Any, Optional


class FactDrivenPromptGenerator:
    """
    Generates fact-based OpenAI prompts from StructuredRiskObject.
    
    Architecture:
    - Input: StructuredRiskObject with signals (factual detections)
    - Output: OpenAI prompt that ONLY explains detected facts
    - Enforcement: Prompt explicitly forbids inventing risks or assumptions
    """

    @staticmethod
    def generate_explanation_prompt(
        structured_risk: Dict[str, Any],
        context: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Generate a fact-driven prompt for OpenAI to explain a detected risk.
        
        Args:
            structured_risk: Dict with rule_id, signals, clause_excerpt, description, etc.
            context: Optional context like {'perspective': 'employee', 'contract_type': 'nda'}
        
        Returns:
            Prompt string to send to OpenAI
        
        CRITICAL CONSTRAINT: The LLM must ONLY explain detected facts from signals.
        Never let it invent risks or assume anything not in the signals dict.
        """
        rule_id = structured_risk.get("rule_id", "UNKNOWN")
        rule_name = structured_risk.get("rule_name", "Unknown Risk")
        signals = structured_risk.get("signals", {})
        clause_excerpt = structured_risk.get("clause_excerpt", "")
        legal_category = structured_risk.get("legal_category", "Legal")
        description = structured_risk.get("description", "")
        why_risky = structured_risk.get("why_risky", "")
        recommendation = structured_risk.get("recommendation", "")

        # Build facts list from signals
        facts = []
        for signal_name, signal_value in signals.items():
            if signal_value:  # Only include True signals
                facts.append(f"- {signal_name.replace('_', ' ')}")

        facts_text = "\n".join(facts) if facts else "- Risk pattern matched in contract text"

        # Build context string
        context_str = ""
        if context:
            if context.get("perspective"):
                context_str += f"User perspective: {context['perspective']}\n"
            if context.get("contract_type"):
                context_str += f"Contract type: {context['contract_type']}\n"

        # Construct the prompt
        prompt = f"""
You are a contract law expert. Your job is to EXPLAIN legal risks based on FACTUAL DETECTIONS, not to invent new risks.

CRITICAL CONSTRAINTS:
- ONLY explain the facts listed below. Do NOT invent new risks.
- Do NOT assume anything not present in the data.
- Do NOT give generic legal advice.
- Base your explanation SOLELY on the detected signals and clause excerpt.
- If the LLM cannot explain a risk based only on the detected facts, say so.

=== DETECTED RISK ===
Rule ID: {rule_id}
Rule Name: {rule_name}
Legal Category: {legal_category}
Risk Level: {structured_risk.get('risk_level', 'UNKNOWN')}

=== DETECTED FACTS (What was found) ===
{facts_text}

=== CLAUSE EXCERPT (The actual text that triggered the rule) ===
"{clause_excerpt}"

=== DEFAULT RULE DESCRIPTIONS (For reference) ===
Description: {description}
Why It's Risky: {why_risky}
Recommended Action: {recommendation}

{context_str if context_str else ''}

=== YOUR TASK ===
Based ONLY on the detected facts above, explain:

1. SUMMARY: In 1-2 sentences, what was detected in the contract?
2. WHY_RISKY: Why are these specific detected facts risky? Tie each reason directly to a detected fact.
3. WHAT_TRIGGERS: List the specific detected facts that make this risky (from the "DETECTED FACTS" section).
4. EXAMPLE_WORDING: Provide example contract language that would fix this specific risk, addressing the detected issues.

Return your response as JSON:
{{
    "summary": "...",
    "why_risky": "...",
    "what_triggers": ["fact 1", "fact 2", ...],
    "example_wording": "..."
}}

REMEMBER: 
- Do NOT invent reasons not based on detected facts.
- Do NOT assume anything about the other party.
- Base every claim on the clause excerpt provided.
- If you cannot explain the risk from the facts alone, say "Unable to explain from provided facts."
"""
        return prompt.strip()

    @staticmethod
    def generate_contract_summary_prompt(
        high_risk_rules: list,
        medium_risk_rules: list,
        context: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Generate a prompt to create overall contract summary from detected risks.
        
        Args:
            high_risk_rules: List of StructuredRiskObject dicts with HIGH risk_level
            medium_risk_rules: List of StructuredRiskObject dicts with MEDIUM risk_level
            context: Optional contract context
        
        Returns:
            Prompt for contract-level risk summary
        """
        high_count = len(high_risk_rules)
        medium_count = len(medium_risk_rules)

        high_rules_text = ""
        if high_risk_rules:
            high_rules_text = "HIGH RISK ISSUES DETECTED:\n"
            for rule in high_risk_rules[:5]:  # Limit to 5 for token length
                high_rules_text += f"- {rule.get('rule_name', 'Unknown')}: {rule.get('description', '')}\n"

        medium_rules_text = ""
        if medium_risk_rules:
            medium_rules_text = "MEDIUM RISK ISSUES DETECTED:\n"
            for rule in medium_risk_rules[:5]:
                medium_rules_text += f"- {rule.get('rule_name', 'Unknown')}: {rule.get('description', '')}\n"

        context_str = ""
        if context and context.get("perspective"):
            context_str = f"\nAnalyzing from perspective: {context['perspective']}"

        prompt = f"""
You are a contract law expert providing risk summaries.

CRITICAL: Base your summary ONLY on the detected risks listed below. 
Do NOT invent new categories of risk not listed.
Do NOT generalize beyond what was detected.

=== DETECTED RISKS ===
Total HIGH risk issues: {high_count}
Total MEDIUM risk issues: {medium_count}

{high_rules_text}
{medium_rules_text}

{context_str if context_str else ''}

=== YOUR TASK ===
Provide a brief (2-3 sentence) executive summary of the contract's overall risk profile based ONLY on the detected issues above.

Remember: Only mention risks that were actually detected. Do not add new risk categories.
"""
        return prompt.strip()
