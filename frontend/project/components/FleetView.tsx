'use client';

import { motion } from 'framer-motion';
import { User, MapPin, Activity } from 'lucide-react';
import { DriverData } from '@/project/utils/mockData';
import { getFatigueLevelColor, getFatigueLevelIcon } from '@/project/utils/helpers';

interface FleetViewProps {
  drivers: DriverData[];
}

export default function FleetView({ drivers }: FleetViewProps) {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Fleet Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((driver, index) => (
          <motion.div
            key={driver.driver_id}
            className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    {driver.driver_name}
                  </h4>
                  <p className="text-xs text-slate-500">{driver.driver_id}</p>
                </div>
              </div>
              <span className="text-xl">
                {getFatigueLevelIcon(driver.fatigue_level)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{driver.location}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Alertness</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: getFatigueLevelColor(
                          driver.fatigue_level
                        ),
                        width: `${driver.alertness_score}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${driver.alertness_score}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: getFatigueLevelColor(driver.fatigue_level),
                    }}
                  >
                    {driver.alertness_score}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Speed</span>
                <span className="text-slate-200 font-medium">
                  {driver.speed} km/h
                </span>
              </div>

              <div
                className="mt-3 pt-3 border-t border-slate-700 rounded-lg px-2 py-1"
                style={{
                  backgroundColor:
                    getFatigueLevelColor(driver.fatigue_level) + '20',
                }}
              >
                <p
                  className="text-xs font-semibold text-center"
                  style={{
                    color: getFatigueLevelColor(driver.fatigue_level),
                  }}
                >
                  {driver.fatigue_level}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
