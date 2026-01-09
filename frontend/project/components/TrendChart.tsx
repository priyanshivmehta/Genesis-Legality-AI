'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendDataPoint } from '@/project/utils/mockData';

interface TrendChartProps {
  data: TrendDataPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
        Alertness Over Time
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="timestamp"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#94a3b8' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#94a3b8' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="alertness"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            activeDot={{ r: 5 }}
            name="Alertness"
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            name="Speed (km/h)"
          />
          <Line
            type="monotone"
            dataKey="blinkRate"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 3 }}
            name="Blink Rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
