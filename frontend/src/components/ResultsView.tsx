import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { ContractAnalysis, SortOption } from '../types';
import ClauseAccordion from './ClauseAccordion';

interface ResultsViewProps {
  analysis: ContractAnalysis;
}

export default function ResultsView({ analysis }: ResultsViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>('clause');

  const sortedInsights = [...analysis.insights].sort((a, b) => {
    if (sortBy === 'risk') {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return a.clauseNumber.localeCompare(b.clauseNumber);
  });

  const riskCounts = analysis.insights.reduce(
    (acc, insight) => {
      acc[insight.riskLevel]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 border-b bg-white shadow-sm">
        <div className="text-2xl font-bold tracking-tight text-blue-600">
          Clause<span className="text-gray-900">AI</span>
        </div>
      </nav>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="w-full max-w-7xl mx-auto px-8 py-10">

        {/* FILE HEADER */}
        <div className="flex items-center space-x-3 mb-8">
          <FileText className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-[1.5rem] font-semibold text-gray-900 leading-tight">
              {analysis.fileName}
            </h1>
            <p className="text-gray-600 text-[0.95rem]">
              Reviewed from{' '}
              <span className="font-medium">
                {analysis.perspective === 'disclosing'
                  ? 'Disclosing Party'
                  : 'Receiving Party'}
              </span>{' '}
              perspective
            </p>
          </div>
        </div>

        {/* SUMMARY PANEL */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-10">
          <div className="flex items-start space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
            <h2 className="text-[1.2rem] font-semibold text-gray-900">
              Summary
            </h2>
          </div>

          <p className="text-gray-700 leading-relaxed text-[0.95rem]">
            {analysis.summary}
          </p>

          {/* RISK SUMMARY */}
          <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{riskCounts.high}</span> High Risk
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{riskCounts.medium}</span> Medium Risk
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">
                <span className="font-semibold">{riskCounts.low}</span> Low Risk
              </span>
            </div>
          </div>
        </div>

        {/* INSIGHTS HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-[1.2rem] font-semibold text-gray-900">AI Insights</h2>
            <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
              {analysis.insights.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="clause">Clause Number</option>
              <option value="risk">Risk Severity</option>
            </select>
          </div>
        </div>

        <ClauseAccordion
          insights={sortedInsights}
          groupedByCategory={sortBy === 'clause'}
        />
      </div>
    </div>
  );
}
