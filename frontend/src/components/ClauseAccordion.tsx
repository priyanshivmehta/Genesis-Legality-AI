import { useState } from 'react';
import { ChevronDown, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { ClauseInsight, RiskLevel } from '../types';

interface ClauseAccordionProps {
  insights: ClauseInsight[];
  groupedByCategory?: boolean;
}

const riskConfig = {
  high: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    label: 'High Risk',
  },
  medium: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    icon: AlertTriangle,
    label: 'Medium Risk',
  },
  low: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: 'Low Risk',
  },
};

export default function ClauseAccordion({
  insights,
  groupedByCategory = true,
}: ClauseAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groupedInsights = groupedByCategory
    ? insights.reduce((acc, insight) => {
        if (!acc[insight.category]) {
          acc[insight.category] = [];
        }
        acc[insight.category].push(insight);
        return acc;
      }, {} as Record<string, ClauseInsight[]>)
    : { All: insights };

  const toggleClause = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
        <div key={category}>
          {groupedByCategory && (
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {category}
            </h3>
          )}
          <div className="space-y-2">
            {categoryInsights.map((insight) => {
              const isExpanded = expandedId === insight.id;
              const risk = riskConfig[insight.riskLevel];
              const RiskIcon = risk.icon;

              return (
                <div
                  key={insight.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleClause(insight.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full ${risk.bgColor} flex items-center justify-center`}
                      >
                        <RiskIcon className={`w-4 h-4 ${risk.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {insight.clauseNumber} {insight.clauseTitle}
                        </div>
                        <div className={`text-xs font-medium ${risk.color} mt-0.5`}>
                          {risk.label}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  

{isExpanded && (
  <div className="border-t border-gray-200 p-6 space-y-6 bg-gray-50">
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${risk.bgColor} ${risk.color}`}
        >
          <RiskIcon className="w-4 h-4 mr-1.5" />
          {risk.label}
        </div>
      </div>
    </div>

    {/* Only render quote if it exists and is valid */}
    {insight.quote && insight.quote.trim().length > 0 && (
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Quote from Contract
        </h4>
        <div className="bg-white border-l-4 border-gray-300 p-4 rounded-r-md">
          <p className="text-sm text-gray-700 italic leading-relaxed">
            "{insight.quote}"
          </p>
        </div>
      </div>
    )}

    {/* Show fallback if quote is missing */}
    {(!insight.quote || insight.quote.trim().length === 0) && (
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Quote from Contract
        </h4>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
          <p className="text-sm text-gray-600 italic">
            Unable to extract readable text for this clause.
          </p>
        </div>
      </div>
    )}

    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        AI Insight
      </h4>
      <div className="bg-white border border-gray-200 p-4 rounded-md">
        <p className="text-sm text-gray-800 leading-relaxed">
          {insight.insight}
        </p>
      </div>
    </div>

    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
        Suggested Change
      </h4>
      <div className="bg-green-50 border-2 border-green-200 p-4 rounded-md">
        <p className="text-sm text-gray-800 leading-relaxed">
          {insight.suggestedChange}
        </p>
      </div>
    </div>
  </div>
)}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
