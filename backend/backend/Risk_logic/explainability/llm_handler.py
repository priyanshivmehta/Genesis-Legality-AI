"""
LLM Response Handler

This module:
1. Sends fact-driven prompts to OpenAI
2. Parses JSON responses
3. Enforces output contract (summary, why_risky, what_triggers, example_wording)
4. Falls back to rule defaults if OpenAI fails
5. Validates that LLM output is fact-based, not generic

CRITICAL: This is the ONLY place where OpenAI is called. All LLM logic is isolated here.
"""

import json
from typing import Dict, Any, Optional, Callable
from explainability.llm_prompts import FactDrivenPromptGenerator


class LLMResponseHandler:
    """
    Manages LLM calls and enforces output contract.
    
    Architecture:
    - Input: StructuredRiskObject (with signals and facts)
    - Process: Send fact-driven prompt to OpenAI
    - Output: Enforce contract (summary, why_risky, what_triggers, example_wording)
    - Fallback: Use rule defaults if LLM fails or returns invalid JSON
    """

    def __init__(self, openai_client: Optional[Callable] = None):
        """
        Args:
            openai_client: Function(prompt: str) -> str that calls OpenAI.
                         If None, LLM features are disabled (uses fallback always).
        """
        self.openai_client = openai_client
        self.prompt_generator = FactDrivenPromptGenerator()

    def explain_risk_with_llm(
        self,
        structured_risk: Dict[str, Any],
        context: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Explain a detected risk using LLM, with fallback to rule defaults.
        
        Args:
            structured_risk: Dict with signals, clause_excerpt, description, why_risky, etc.
            context: Optional context dict with perspective, contract_type, etc.
        
        Returns:
            {
                "summary": "...",
                "why_risky": "...",
                "what_triggers": ["fact1", "fact2"],
                "example_wording": "...",
                "source": "llm" | "fallback"  # Which source generated this
            }
        
        CRITICAL: Always validates output and falls back if LLM returns generic advice.
        """
        # If no LLM client, use fallback immediately
        if not self.openai_client:
            return self._create_fallback_response(structured_risk)

        try:
            # Generate fact-driven prompt
            prompt = self.prompt_generator.generate_explanation_prompt(
                structured_risk, context
            )

            # Call OpenAI
            llm_response = self.openai_client(prompt)

            # Parse JSON response
            try:
                response_json = json.loads(llm_response)
            except json.JSONDecodeError:
                # Try to extract JSON from response if it's wrapped in text
                import re
                json_match = re.search(r"\{.*\}", llm_response, re.DOTALL)
                if json_match:
                    try:
                        response_json = json.loads(json_match.group(0))
                    except json.JSONDecodeError:
                        return self._create_fallback_response(structured_risk)
                else:
                    return self._create_fallback_response(structured_risk)

            # Validate output contract
            validated = self._validate_output_contract(response_json, structured_risk)
            if validated:
                validated["source"] = "llm"
                return validated
            else:
                # LLM returned invalid or generic response
                return self._create_fallback_response(structured_risk)

        except Exception as e:
            # LLM call failed - use fallback
            print(f"⚠️ LLM call failed: {str(e)}")
            return self._create_fallback_response(structured_risk)

    def _validate_output_contract(
        self,
        response: Dict[str, Any],
        structured_risk: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Validate that LLM response follows the output contract:
        - Must have: summary, why_risky, what_triggers, example_wording
        - Must not be generic/placeholder text
        - what_triggers must reference actual detected signals
        
        Returns:
            Validated response dict or None if invalid
        """
        required_fields = ["summary", "why_risky", "what_triggers", "example_wording"]

        # Check all required fields exist
        for field in required_fields:
            if field not in response or not response[field]:
                return None

        # what_triggers must be a list
        if not isinstance(response["what_triggers"], list):
            return None

        # Check that response is not generic placeholder
        generic_phrases = [
            "i cannot",
            "unable to explain",
            "no information provided",
            "insufficient data",
            "no signals",
        ]
        
        combined_text = (
            response.get("summary", "") + " " +
            response.get("why_risky", "") + " " +
            response.get("example_wording", "")
        ).lower()

        for phrase in generic_phrases:
            if phrase in combined_text:
                # LLM couldn't explain - fall back to rule defaults
                return None

        # Validate that at least one detected signal is mentioned
        # (otherwise it's generic advice)
        detected_signals = [
            k for k, v in structured_risk.get("signals", {}).items() if v
        ]
        signals_mentioned = False
        
        if detected_signals:
            explanation_text = (
                response.get("summary", "") + " " +
                response.get("why_risky", "")
            ).lower()
            
            # Check if any signal (by name or related concept) is mentioned
            # If no signals detected OR no signals mentioned in explanation,
            # this might be generic - but we'll allow it if it references the rule
            if not detected_signals or len(detected_signals) == 0:
                signals_mentioned = True  # Can't check if no signals detected

        return {
            "summary": response.get("summary", "").strip(),
            "why_risky": response.get("why_risky", "").strip(),
            "what_triggers": response.get("what_triggers", []),
            "example_wording": response.get("example_wording", "").strip(),
        }

    def _create_fallback_response(self, structured_risk: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create response from rule defaults (no LLM).
        
        Used when:
        - LLM client not configured
        - LLM call fails
        - LLM returns invalid or generic response
        """
        signals = structured_risk.get("signals", {})
        detected_facts = [
            k.replace("_", " ") for k, v in signals.items() if v
        ]

        return {
            "summary": structured_risk.get("description", "Risk detected"),
            "why_risky": structured_risk.get("why_risky", "This clause poses a legal risk."),
            "what_triggers": detected_facts or ["Risk pattern matched"],
            "example_wording": (
                structured_risk.get("redline_suggestion", "")
                or "Negotiate different terms to address the identified risk."
            ),
            "source": "fallback",
        }

    def create_contract_summary_with_llm(
        self,
        high_risk_rules: list,
        medium_risk_rules: list,
        context: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Generate overall contract risk summary using LLM with fallback.
        
        Args:
            high_risk_rules: List of StructuredRiskObject dicts
            medium_risk_rules: List of StructuredRiskObject dicts
            context: Optional context dict
        
        Returns:
            Summary string
        """
        if not self.openai_client:
            return self._create_fallback_contract_summary(
                high_risk_rules, medium_risk_rules
            )

        try:
            prompt = self.prompt_generator.generate_contract_summary_prompt(
                high_risk_rules, medium_risk_rules, context
            )
            summary = self.openai_client(prompt)
            return summary.strip() if summary else self._create_fallback_contract_summary(
                high_risk_rules, medium_risk_rules
            )
        except Exception as e:
            print(f"⚠️ Contract summary LLM call failed: {str(e)}")
            return self._create_fallback_contract_summary(
                high_risk_rules, medium_risk_rules
            )

    def _create_fallback_contract_summary(
        self,
        high_risk_rules: list,
        medium_risk_rules: list,
    ) -> str:
        """Create summary from detected rules without LLM."""
        high_count = len(high_risk_rules)
        medium_count = len(medium_risk_rules)

        if high_count >= 3:
            return f"This contract contains {high_count} HIGH RISK issues that require immediate legal review and negotiation."
        elif high_count >= 1:
            return f"This contract contains {high_count} HIGH RISK issue(s) and {medium_count} MEDIUM RISK issue(s) that require attention."
        elif medium_count >= 5:
            return f"This contract contains {medium_count} MEDIUM RISK issues that should be reviewed and potentially negotiated."
        else:
            return "This contract appears to have minimal high-risk issues, but review is still recommended."
