'use client';

import { motion } from 'framer-motion';
import { getFatigueLevelColor } from '@/project/utils/helpers';

interface AlertnessGaugeProps {
  score: number;
  level: string;
}

export default function AlertnessGauge({ score, level }: AlertnessGaugeProps) {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getFatigueLevelColor(level);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Driver Alertness
      </h3>
      <div className="relative">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold"
            style={{ color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400 mt-1">/ 100</span>
        </div>
      </div>
      <motion.div
        className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ backgroundColor: color + '20', color }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {level}
      </motion.div>
    </div>
  );
}
