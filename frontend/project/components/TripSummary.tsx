'use client';

import { motion } from 'framer-motion';
import { Download, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/project/components/ui/button';
import { TrendDataPoint, AlertEntry } from '@/project/utils/mockData';

interface TripSummaryProps {
  averageAlertness: number;
  totalAlerts: number;
  tripDuration: number;
  onExport: () => void;
}

export default function TripSummary({
  averageAlertness,
  totalAlerts,
  tripDuration,
  onExport,
}: TripSummaryProps) {
  const stats = [
    {
      label: 'Avg. Alertness',
      value: averageAlertness,
      unit: '/100',
      icon: TrendingUp,
      color: averageAlertness >= 70 ? '#10b981' : '#f97316',
    },
    {
      label: 'Total Alerts',
      value: totalAlerts,
      unit: '',
      icon: AlertCircle,
      color: totalAlerts > 5 ? '#ef4444' : '#3b82f6',
    },
    {
      label: 'Trip Duration',
      value: tripDuration,
      unit: ' min',
      icon: Clock,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Trip Summary
      </h3>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-center mb-2">
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
              <span className="text-sm text-slate-400">{stat.unit}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      <Button
        onClick={onExport}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
      >
        <Download className="w-4 h-4 mr-2" />
        Generate Trip Report
      </Button>
    </div>
  );
}
