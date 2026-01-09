'use client';

import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { getRecommendedAction } from '@/project/utils/mockData';

interface FatiguePredictionProps {
  predictedTime: string;
  fatigueLevel: string;
}

export default function FatiguePrediction({
  predictedTime,
  fatigueLevel,
}: FatiguePredictionProps) {
  const recommendation = getRecommendedAction(fatigueLevel, predictedTime);
  const isUrgent = predictedTime.includes('< 5') || fatigueLevel === 'Critical';

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Fatigue Prediction
      </h3>
      <div className="space-y-4">
        <motion.div
          className={`rounded-xl p-4 border-2 ${
            isUrgent
              ? 'bg-red-500/10 border-red-500'
              : 'bg-blue-500/10 border-blue-500'
          }`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock
              className={`w-5 h-5 ${
                isUrgent ? 'text-red-400' : 'text-blue-400'
              }`}
            />
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isUrgent ? 'text-red-400' : 'text-blue-400'
              }`}
            >
              Predicted Fatigue
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              isUrgent ? 'text-red-300' : 'text-blue-300'
            }`}
          >
            {predictedTime}
          </p>
        </motion.div>

        <motion.div
          className={`rounded-xl p-4 ${
            isUrgent
              ? 'bg-red-900/20 border-2 border-red-500/50'
              : 'bg-slate-700/30 border border-slate-600'
          }`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isUrgent ? 'text-red-400' : 'text-yellow-400'
              }`}
            />
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                Recommended Action
              </p>
              <p
                className={`text-sm font-medium ${
                  isUrgent ? 'text-red-200' : 'text-slate-200'
                }`}
              >
                {recommendation}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
