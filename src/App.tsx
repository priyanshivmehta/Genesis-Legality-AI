import { useState } from "react";
import ContractViewer from "./ContractViewer";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Upload failed:", err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Contract Analyzer</h1>

      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />

      {loading && <p>Analyzing contract...</p>}

      {data && <ContractViewer data={data} />}
    </div>
  );
}

export default App;
