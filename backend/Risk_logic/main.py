# Updated main.py
"""
Enhanced Legal Contract Risk Analyzer
Complete pipeline with playbook support and redline generation
"""

from ingestion.input_handler import ingest_contract
from segmentation.clause_splitter import segment_clauses
from intelligence.contract_analyzer import ContractAnalyzer
import json
import os

def print_analysis_results(analysis: dict):
    """Pretty print analysis results."""
    
    print("\n" + "="*80)
    print("CONTRACT RISK ANALYSIS REPORT")
    print("="*80)
    
    # Check for parse failure
    if analysis.get("status") == "PARSE_FAILED":
        print("\n⚠️  CRITICAL: CONTRACT PARSING FAILED")
        print("="*80)
        print(f"\n{analysis.get('message', 'Unable to parse contract')}")
        print("\n📋 RECOMMENDATIONS:")
        for rec in analysis["explanations"]["overall_recommendations"]:
            print(f"   • {rec}")
        return
    
    # Executive Summary
    explanations = analysis["explanations"]
    summary = analysis["summary"]
    
    print(f"\n{explanations['executive_summary']}")
    
    print(f"\n📊 STATISTICS:")
    stats = explanations["statistics"]
    print(f"   Total Clauses: {stats['total_clauses']}")
    print(f"   🔴 High Risk: {stats['high_risk']}")
    print(f"   🟡 Medium Risk: {stats['medium_risk']}")
    print(f"   🟢 Low Risk: {stats['low_risk']}")
    print(f"   Total Issues Found: {stats['total_issues']}")
    
    # Clause type breakdown
    if summary["clause_type_breakdown"]:
        print(f"\n📋 CLAUSE TYPES DETECTED:")
        for ctype, count in sorted(summary["clause_type_breakdown"].items()):
            print(f"   - {ctype}: {count}")
    else:
        print(f"\n📋 CLAUSE TYPES DETECTED: None")
    
    # Key entities
    entities = summary["contract_entities"]
    if any(entities.values()):
        print(f"\n🔍 KEY ENTITIES EXTRACTED:")
        if entities["money"]:
            print(f"   💰 Money: {', '.join(entities['money'][:5])}")
        if entities["dates"]:
            print(f"   📅 Dates: {', '.join(entities['dates'][:5])}")
        if entities["durations"]:
            print(f"   ⏱️ Durations: {', '.join(entities['durations'][:3])}")
        if entities["parties"]:
            print(f"   👥 Parties: {', '.join(entities['parties'][:3])}")
        if entities["locations"]:
            print(f"   📍 Locations: {', '.join(entities['locations'][:3])}")
    
    # Detailed risk explanations
    if explanations["risky_clauses"]:
        print(f"\n{'='*80}")
        print("DETAILED RISK ANALYSIS")
        print("="*80)
        
        for i, clause_exp in enumerate(explanations["risky_clauses"], 1):
            print(f"\n[{i}] CLAUSE {clause_exp['clause_id']}: {clause_exp['clause_title']}")
            print(f"    {clause_exp['summary']}")
            
            for issue in clause_exp["issues"]:
                print(f"\n    [{issue['severity']}] {issue['issue']}")
                print(f"    📝 What it means: {issue['what_it_means']}")
                print(f"    ⚠️  Why it's risky: {issue['why_its_risky']}")
            
            if clause_exp["recommendations"]:
                print(f"\n    💡 RECOMMENDED ACTIONS:")
                for rec in clause_exp["recommendations"]:
                    print(f"       • {rec['action']}")
            
            if clause_exp.get("redlines"):
                print(f"\n    ✏️  SUGGESTED REDLINES:")
                for redline in clause_exp["redlines"]:
                    print(f"       {redline['suggestion']}")
    
    # Overall recommendations
    print(f"\n{'='*80}")
    print("OVERALL RECOMMENDATIONS")
    print("="*80)
    for rec in explanations["overall_recommendations"]:
        print(f"  {rec}")
    
    print(f"\n{'='*80}\n")


def main():
    """Main execution pipeline."""
    print("🔍 Legal Contract Risk Analyzer v2.0")
    print("="*80)
    
    # Configuration
    contract_file = "NDA_test.pdf"  # Change to your contract file
    playbook_file = "playbooks/sample_playbook.json"  # Optional
    contract_type = "nda"          # Options: nda, services, employment
    perspective = "vendor"       # Options: discloser/receiver, employer/employee, client/vendor
    
    # Optional: Define LLM client for explanation polishing
    try:
        from openai import OpenAI
        api_key = os.getenv("OPENAI_API_KEY")
        client = OpenAI(api_key=api_key) if api_key else None

        def llm_client(prompt: str) -> str:
            if not client:
                return None
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )
            return response.choices[0].message.content

    except ImportError:
        client = None
        llm_client = None  # Leave None to use fallback text
    
    tone = "founder"   # Options: default, founder, student, enterprise
    
    # Step 1: Document Ingestion
    print("\n[1/5] 📄 Ingesting contract document...")
    result = ingest_contract(file_path=contract_file)
    print(f"      ✓ Extracted {len(result['text'])} characters")
    print(f"      ✓ OCR used: {result['metadata']['ocr_used']}")
    
    # Step 2: Clause Segmentation
    print("\n[2/5] ✂️  Segmenting clauses...")
    clauses = segment_clauses(result["text"])
    print(f"      ✓ Identified {len(clauses)} distinct clauses")
    
    # Warn if no clauses detected
    if not clauses or len(clauses) == 0:
        print("      ⚠️  WARNING: No clauses detected - analysis may be unreliable")
    
    # Step 3: AI Analysis with Playbook and optional LLM
    print("\n[3/5] 🤖 Running AI risk analysis...")
    analyzer = ContractAnalyzer(
        playbook_path=playbook_file if os.path.exists(playbook_file) else None,
        llm_client=llm_client,
        tone=tone
    )
    analysis = analyzer.analyze_contract(
        clauses,
        contract_type=contract_type,
        perspective=perspective,
    )
    print(f"      ✓ Analysis complete")
    print(f"      ✓ Contract type: {contract_type}, Perspective: {perspective}")
    print(f"      ✓ Risk level: {analysis['risk_analysis']['overall_risk']}")
    
    # Step 4: Generate Explanations
    print("\n[4/5] 💬 Generating explanations...")
    print(f"      ✓ {len(analysis['explanations']['risky_clauses'])} risky clauses explained")
    print(f"      ✓ {len(analysis['explanations'].get('suggested_redlines', []))} redline suggestions generated")
    
    # Step 5: Output Results
    print("\n[5/5] 💾 Saving results...")
    
    # Save full JSON output
    with open("contract_analysis_output.json", "w") as f:
        json.dump(analysis, f, indent=2)
    print("      ✓ Full analysis saved to contract_analysis_output.json")
    
    # Save redline document
    from explainability.explainer import RiskExplainer
    explainer = RiskExplainer()
    redline_doc = explainer.generate_redline_document(analysis["explanations"])
    with open("contract_redlines.txt", "w") as f:
        f.write(redline_doc)
    print("      ✓ Redline suggestions saved to contract_redlines.txt")
    
    # Display results
    print_analysis_results(analysis)


if __name__ == "__main__":
    main()