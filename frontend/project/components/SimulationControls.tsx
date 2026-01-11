'use client';

import { motion } from 'framer-motion';
import {
  Coffee,
  TrendingUp,
  Navigation2,
  MapPin,
  RotateCcw,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationControlsProps {
  onAddFatigue: () => void;
  onIncreaseSpeed: () => void;
  onSimulateDrift: () => void;
  onChangeRoute: () => void;
  onReset: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export default function SimulationControls({
  onAddFatigue,
  onIncreaseSpeed,
  onSimulateDrift,
  onChangeRoute,
  onReset,
  isSimulating,
  onToggleSimulation,
}: SimulationControlsProps) {
  const controls = [
    {
      label: 'Add Fatigue Event',
      icon: Coffee,
      onClick: onAddFatigue,
      color: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/50',
    },
    {
      label: 'Increase Speed',
      icon: TrendingUp,
      onClick: onIncreaseSpeed,
      color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/50',
    },
    {
      label: 'Simulate Lane Drift',
      icon: Navigation2,
      onClick: onSimulateDrift,
      color: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/50',
    },
    {
      label: 'Change Route',
      icon: MapPin,
      onClick: onChangeRoute,
      color: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/50',
    },
  ];

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Simulation Controls
      </h3>
      <div className="space-y-3">
        <Button
          onClick={onToggleSimulation}
          className={`w-full justify-start gap-3 ${
            isSimulating
              ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/50'
              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50'
          } border`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-4 h-4" />
              Pause Auto-Updates
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Auto-Updates
            </>
          )}
        </Button>

        {controls.map((control, index) => (
          <motion.div
            key={control.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              onClick={control.onClick}
              className={`w-full justify-start gap-3 ${control.color} border`}
            >
              <control.icon className="w-4 h-4" />
              {control.label}
            </Button>
          </motion.div>
        ))}

        <Button
          onClick={onReset}
          className="w-full justify-start gap-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Metrics
        </Button>
      </div>
    </div>
  );
}
