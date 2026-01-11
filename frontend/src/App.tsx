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

  // frontend/src/App.tsx
// Replace the handleReview function (around line 28-100)

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

    const response = await fetch("https://genesis-legality-ai-1.onrender.com/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Backend failed");

    const backend = await response.json();

    // Check if parsing failed
    if (backend.status === "PARSE_FAILED") {
      alert(
        backend.message ||
          "Unable to extract readable text from the document. Please ensure the file is not corrupted and contains readable text."
      );
      setLoading(false);
      return;
    }

    // build lookup maps
    const clauseLookup = Object.fromEntries(
      (backend.clauses || []).map((c: any) => [c.id, c])
    );

    const riskyLookup = Object.fromEntries(
      (backend.explanations?.risky_clauses || []).map((r: any) => [r.clause_id, r])
    );

    // Validate and sanitize quote text
    const sanitizeQuote = (text: string): string => {
      if (!text || typeof text !== 'string') return "";
      
      // Check if it's binary data
      if (text.trim().startsWith('%PDF')) return "";
      
      // Check if it's mostly non-printable characters
      const printableRatio = text.split('').filter(c => 
        c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 126 || c === '\n' || c === '\r' || c === '\t'
      ).length / text.length;
      
      if (printableRatio < 0.8) return "";
      
      return text.trim();
    };

    // convert backend → UI
    const mappedInsights = (backend.risk_analysis?.clause_analyses || []).map((c: any) => {
      const clause = clauseLookup[c.clause_id];
      const risky = riskyLookup[c.clause_id];
      
      const quote = sanitizeQuote(clause?.text || "");

      return {
        id: c.clause_id,
        clauseNumber: c.clause_id,
        clauseTitle: c.clause_title || clause?.title || "",
        riskLevel: (c.risk_level || "LOW").toLowerCase(),
        quote: quote,
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
      summary: backend?.explanations?.contract_summary || backend?.explanations?.executive_summary || "No summary generated.",
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
