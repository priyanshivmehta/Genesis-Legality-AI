import { useState } from 'react';
import { Clock, Trash2, X, ChevronLeft, FileText } from 'lucide-react';
import { ContractAnalysis } from '../types';

interface HistorySidebarProps {
  history: ContractAnalysis[];
  currentAnalysisId: string | null;
  onSelectAnalysis: (analysis: ContractAnalysis) => void;
  onClearHistory: () => void;
  onNewAnalysis: () => void;
}

export default function HistorySidebar({
  history,
  currentAnalysisId,
  onSelectAnalysis,
  onClearHistory,
  onNewAnalysis,
}: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleClearHistory = () => {
    onClearHistory();
    setShowClearConfirm(false);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-all text-gray-700 hover:text-gray-900"
      >
        <Clock className="w-5 h-5" />
        <span className="font-medium">History</span>
        {history.length > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            {history.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Review History
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No reviews yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Your analyzed contracts will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((analysis) => (
                    <button
                      key={analysis.id}
                      onClick={() => {
                        onSelectAnalysis(analysis);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        currentAnalysisId === analysis.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {analysis.fileName}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {analysis.perspective === 'disclosing'
                              ? 'Disclosing Party'
                              : 'Receiving Party'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(analysis.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 space-y-2">
              <button
                onClick={onNewAnalysis}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>New Analysis</span>
              </button>

              {history.length > 0 && (
                <>
                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear History</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 text-center">
                        Are you sure? This cannot be undone.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleClearHistory}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Yes, Clear
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
