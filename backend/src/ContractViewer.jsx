
function ContractViewer({ data }) {
  if (!data || !data.risk_analysis) {
    return <p>No analysis available.</p>;
  }
  const { clauses, risk_analysis } = data;

  const riskMap = {};
  risk_analysis.clause_analyses.forEach(item => {
    riskMap[item.clause_id] = item.risk_level;
  });

  const riskColors = {
    HIGH: "#ffcccc",
    MEDIUM: "#ffe5b4",
    LOW: "#e6ffe6"
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Contract Review</h2>

      {clauses.map(clause => {
        const riskLevel = riskMap[clause.id] || "LOW";

        return (
          <div
            key={clause.id}
            style={{
              backgroundColor: riskColors[riskLevel],
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "6px"
            }}
          >
            <h4>
              Clause {clause.id}: {clause.title}
            </h4>
            <p>{clause.text}</p>
            <small>Risk Level: {riskLevel}</small>
          </div>
        );
      })}
    </div>
  );
}

export default ContractViewer;
