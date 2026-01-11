import { useState } from 'react';
import { FileText, ArrowRight, Info } from 'lucide-react';
import { PartyPerspective } from '../types';

interface ContextStepProps {
  fileName: string;
  fileSize: number;
  onReview: (perspective: 'disclosing' | 'receiving') => void;
}

export default function ContextStep({
  fileName,
  fileSize,
  onReview,
}: ContextStepProps) {
  const [selectedPerspective, setSelectedPerspective] = useState<PartyPerspective>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReview = () => {
    if (selectedPerspective) onReview(selectedPerspective);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 border-b bg-white shadow-sm">
        <div className="text-2xl font-bold tracking-tight text-blue-600">
          Clause<span className="text-gray-900">AI</span>
        </div>
      </nav>

      {/* DASHBOARD CONTENT */}
      <div className="mx-auto w-full max-w-7xl px-8 py-10">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-[1.85rem] font-semibold text-gray-900 mb-2 leading-tight bold">
            We need some more information about your contract...
          </h1>
          <p className="text-gray-600 text-[0.95rem]">
            Help us tailor your analysis by specifying your position in the agreement.
          </p>
        </div>

        {/* FILE CARD */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-8 flex items-center space-x-4">
          <FileText className="w-10 h-10 text-blue-600" />
          <div className="flex flex-col">
            <p className="font-medium text-gray-900 text-[1rem]">{fileName}</p>
            <p className="text-[0.9rem] text-gray-600">{formatFileSize(fileSize)}</p>
          </div>
        </div>

        {/* QUESTION + OPTIONS */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          
          <h2 className="text-[1.25rem] font-semibold text-gray-900 mb-3">
            Review Perspective
          </h2>

          <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-md p-3 mb-6">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p>
              Every party has different risk exposure and obligations. Select the perspective from which we should evaluate the contract.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {/* Disclosing */}
            <label
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPerspective === 'disclosing'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="perspective"
                value="disclosing"
                checked={selectedPerspective === 'disclosing'}
                onChange={(e) => setSelectedPerspective(e.target.value as 'disclosing')}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900 mb-1">Disclosing Party</div>
                <div className="text-[0.9rem] text-gray-600 leading-relaxed">
                  You are sharing confidential or sensitive information with another party.
                </div>
              </div>
            </label>

            {/* Receiving */}
            <label
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedPerspective === 'receiving'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="perspective"
                value="receiving"
                checked={selectedPerspective === 'receiving'}
                onChange={(e) => setSelectedPerspective(e.target.value as 'receiving')}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900 mb-1">Receiving Party</div>
                <div className="text-[0.9rem] text-gray-600 leading-relaxed">
                  You receive confidential information and are expected to protect it under the agreement.
                </div>
              </div>
            </label>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end">
            <button
              onClick={handleReview}
              disabled={!selectedPerspective}
              className={`px-6 py-2.5 rounded-md flex items-center space-x-2 font-medium transition-all ${
                selectedPerspective
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
