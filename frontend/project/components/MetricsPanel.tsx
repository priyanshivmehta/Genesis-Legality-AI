'use client';

import { motion } from 'framer-motion';
import { Activity, Navigation, Gauge, MapPin } from 'lucide-react';
import { DriverData } from '@/project/utils/mockData';

interface MetricsPanelProps {
  data: DriverData;
}

export default function MetricsPanel({ data }: MetricsPanelProps) {
  const metrics = [
    {
      label: 'Blink Rate',
      value: `${data.blink_rate}`,
      unit: 'blinks/min',
      icon: Activity,
      color: data.blink_rate < 10 ? '#ef4444' : '#10b981',
    },
    {
      label: 'Steering Deviation',
      value: `${data.steering_deviation}`,
      unit: '%',
      icon: Navigation,
      color: data.steering_deviation > 7 ? '#ef4444' : '#10b981',
    },
    {
      label: 'Speed',
      value: `${data.speed}`,
      unit: 'km/h',
      icon: Gauge,
      color: data.speed > 90 ? '#f97316' : '#3b82f6',
    },
    {
      label: 'Location',
      value: data.location.split(',')[0],
      unit: '',
      icon: MapPin,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          className="bg-slate-800/50 rounded-xl border border-slate-700 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 uppercase tracking-wider">
                  {metric.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <motion.span
                  className="text-2xl font-bold"
                  style={{ color: metric.color }}
                  key={metric.value}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {metric.value}
                </motion.span>
                {metric.unit && (
                  <span className="text-sm text-slate-400">{metric.unit}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
