import { useState, useEffect } from "react";
import { Step, ContractAnalysis, PartyPerspective } from "./types";
import UploadStep from "./components/UploadStep";
import ContextStep from "./components/ContextStep";
import ResultsView from "./components/ResultsView";
import HistorySidebar from "./components/HistorySidebar";
import { saveToHistory, getHistory, clearHistory } from "./utils/storage";

function App() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<ContractAnalysis | null>(null);
  const [history, setHistory] = useState<ContractAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleUploadComplete = (name: string, size: number, selectedFile: File) => {
    setFileName(name);
    setFileSize(size);
    setFile(selectedFile);
    setCurrentStep("context");
  };

  const handleReview = async (perspective: PartyPerspective) => {
    if (!file) {
      alert("No file selected!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      if (perspective) {
        formData.append("perspective", perspective);
      }

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend failed");

      const backend = await response.json();

      // build lookup maps
      const clauseLookup = Object.fromEntries(
        (backend.clauses || []).map((c: any) => [c.id, c])
      );

      const riskyLookup = Object.fromEntries(
        (backend.explanations?.risky_clauses || []).map((r: any) => [r.clause_id, r])
      );

      // convert backend → UI
      const mappedInsights = (backend.risk_analysis?.clause_analyses || []).map((c: any) => {
        const clause = clauseLookup[c.clause_id];
        const risky = riskyLookup[c.clause_id];

        return {
          id: c.clause_id,
          clauseNumber: c.clause_id,
          clauseTitle: c.clause_title || clause?.title || "",
          riskLevel: (c.risk_level || "LOW").toLowerCase(),
          quote: clause?.text || "",
          insight: risky?.summary || "No insight available.",
          suggestedChange:
            risky?.recommendations?.[0]?.action ||
            "No suggested changes.",
          category: clause?.primary_type || "General",
        };
      });

      const analysis: ContractAnalysis = {
        id: Date.now().toString(),
        fileName,
        fileSize,
        perspective,
        summary: backend?.explanations?.contract_summary || "No summary generated.",
        insights: mappedInsights,
        timestamp: Date.now(),
      };

      setCurrentAnalysis(analysis);
      saveToHistory(analysis);
      setHistory(getHistory());
      setCurrentStep("results");

    } catch (err) {
      console.error(err);
      alert("Something went wrong while analyzing the contract.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnalysis = (analysis: ContractAnalysis) => {
    setCurrentAnalysis(analysis);
    setFileName(analysis.fileName);
    setFileSize(analysis.fileSize);
    setCurrentStep("results");
  };

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
    setFileName("");
    setFileSize(0);
    setFile(null);
    setCurrentStep("upload");
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <>
      {currentStep === "results" && (
        <HistorySidebar
          history={history}
          currentAnalysisId={currentAnalysis?.id || null}
          onSelectAnalysis={handleSelectAnalysis}
          onClearHistory={handleClearHistory}
          onNewAnalysis={handleNewAnalysis}
        />
      )}

      {currentStep === "upload" && (
        <UploadStep onComplete={handleUploadComplete} loading={loading} />
      )}

      {currentStep === "context" && (
        <ContextStep
          fileName={fileName}
          fileSize={fileSize}
          onReview={handleReview}
        />
      )}

      {currentStep === "results" && currentAnalysis && (
        <ResultsView analysis={currentAnalysis} />
      )}
    </>
  );
}

export default App;
