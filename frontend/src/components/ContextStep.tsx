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
  const [selectedPerspective, setSelectedPerspective] =
    useState<PartyPerspective>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReview = () => {
    if (selectedPerspective && selectedPerspective !== null) {
      onReview(selectedPerspective);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            We need a bit more information…
          </h1>
          <p className="text-gray-600">
            Help us tailor the analysis to your specific needs
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-10 h-10 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-600">{formatFileSize(fileSize)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Which Party's Perspective Should We Review The Contract From?
            </h2>
            <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-md p-3">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p>
                Your perspective matters. Different parties face different risks in
                the same contract. We'll analyze obligations, liabilities, and terms
                specific to your role.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
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
                onChange={(e) =>
                  setSelectedPerspective(e.target.value as 'disclosing')
                }
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900 mb-1">
                  Disclosing Party
                </div>
                <div className="text-sm text-gray-600">
                  You're sharing confidential information with another party (e.g.,
                  your trade secrets, business plans, proprietary data)
                </div>
              </div>
            </label>

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
                onChange={(e) =>
                  setSelectedPerspective(e.target.value as 'receiving')
                }
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900 mb-1">
                  Receiving Party
                </div>
                <div className="text-sm text-gray-600">
                  You're receiving confidential information from another party and
                  must protect it (e.g., evaluating a partnership, reviewing vendor
                  information)
                </div>
              </div>
            </label>
          </div>

          <button
            onClick={handleReview}
            disabled={!selectedPerspective}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
              selectedPerspective
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Review Contract</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
