'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { AlertEntry } from '@/project/utils/mockData';

interface AlertLogProps {
  alerts: AlertEntry[];
}

export default function AlertLog({ alerts }: AlertLogProps) {
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5' };
      case 'warning':
        return { bg: '#78350f', border: '#f97316', text: '#fdba74' };
      default:
        return { bg: '#1e3a8a', border: '#3b82f6', text: '#93c5fd' };
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Alert Log
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No alerts yet. System monitoring active.
            </div>
          ) : (
            alerts.slice().reverse().map((alert) => {
              const colors = getAlertColor(alert.severity);
              return (
                <motion.div
                  key={alert.id}
                  className="rounded-lg p-4 border-l-4"
                  style={{
                    backgroundColor: colors.bg + '40',
                    borderColor: colors.border,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <div style={{ color: colors.text }}>
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className="text-xs font-semibold uppercase"
                          style={{ color: colors.text }}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-xs text-slate-400">
                          {alert.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 mb-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-slate-400">
                        Action: {alert.action}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
