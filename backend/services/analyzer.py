from Risk_logic.ingestion.input_handler import ingest_contract
from Risk_logic.segmentation.clause_splitter import segment_clauses
from Risk_logic.intelligence.contract_analyzer import ContractAnalyzer


def run_analysis(file_path):
    # 1️⃣ Ingest file → clean text
    ingestion_result = ingest_contract(file_path=file_path)
    text = ingestion_result["text"]

    # 2️⃣ Text → clauses
    clauses = segment_clauses(text)

    # 3️⃣ Analyze clauses
    analyzer = ContractAnalyzer()
    result = analyzer.analyze_contract(
        clauses=clauses,
        contract_type="nda",
        perspective="receiver"
    )

    return result
