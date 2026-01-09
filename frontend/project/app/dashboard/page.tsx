'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Truck,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, Driver, Vehicle, RealTimeMetric } from '@/lib/supabase';
import { updateDriverMetrics } from '@/lib/fleetData';

interface DriverWithMetrics extends Driver {
  metrics?: RealTimeMetric;
  vehicle?: Vehicle;
}

export default function DashboardPage() {
  const [drivers, setDrivers] = useState<DriverWithMetrics[]>([]);
  const [stats, setStats] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    criticalAlerts: 0,
    averageAlertness: 0,
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    const [driversRes, vehiclesRes, assignmentsRes, metricsRes, alertsRes] =
      await Promise.all([
        supabase.from('drivers').select('*'),
        supabase.from('vehicles').select('*'),
        supabase
          .from('driver_assignments')
          .select('*, drivers(*), vehicles(*)')
          .eq('status', 'in_progress'),
        supabase
          .from('real_time_metrics')
          .select('*')
          .order('timestamp', { ascending: false }),
        supabase
          .from('alerts')
          .select('*')
          .eq('acknowledged', false)
          .eq('severity', 'critical'),
      ]);

    const driversData = driversRes.data || [];
    const vehiclesData = vehiclesRes.data || [];
    const assignmentsData = assignmentsRes.data || [];
    const metricsData = metricsRes.data || [];
    const alertsData = alertsRes.data || [];

    const latestMetrics = new Map();
    metricsData.forEach((metric) => {
      if (!latestMetrics.has(metric.driver_id)) {
        latestMetrics.set(metric.driver_id, metric);
      }
    });

    const driversWithMetrics = driversData.map((driver) => {
      const assignment = assignmentsData.find((a: any) => a.driver_id === driver.id);
      return {
        ...driver,
        metrics: latestMetrics.get(driver.id),
        vehicle: assignment?.vehicles,
      };
    });

    setDrivers(driversWithMetrics);

    const activeDriversCount = driversData.filter(
      (d: any) => d.status === 'on_duty'
    ).length;
    const activeVehiclesCount = vehiclesData.filter(
      (v: any) => v.status === 'in_use'
    ).length;

    const alertnessScores = Array.from(latestMetrics.values()).map(
      (m: any) => m.alertness_score
    );
    const avgAlertness =
      alertnessScores.length > 0
        ? Math.round(
            alertnessScores.reduce((a, b) => a + b, 0) / alertnessScores.length
          )
        : 0;

    setStats({
      totalDrivers: driversData.length,
      activeDrivers: activeDriversCount,
      totalVehicles: vehiclesData.length,
      activeVehicles: activeVehiclesCount,
      criticalAlerts: alertsData.length,
      averageAlertness: avgAlertness,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_duty':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'off_duty':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getFatigueLevelColor = (level?: string) => {
    switch (level) {
      case 'Alert':
        return 'text-green-400';
      case 'Mild':
        return 'text-yellow-400';
      case 'Moderate':
        return 'text-orange-400';
      case 'Critical':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const statCards = [
    {
      title: 'Total Drivers',
      value: stats.totalDrivers,
      subtitle: `${stats.activeDrivers} on duty`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Fleet Vehicles',
      value: stats.totalVehicles,
      subtitle: `${stats.activeVehicles} in use`,
      icon: Truck,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Critical Alerts',
      value: stats.criticalAlerts,
      subtitle: 'Require attention',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'Avg. Alertness',
      value: `${stats.averageAlertness}%`,
      subtitle: 'Fleet average',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Live Driver Locations
            </h2>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              {stats.activeDrivers} Active
            </Badge>
          </div>

          <div className="relative w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-slate-600" />
            </div>

            <div className="absolute inset-0 p-4">
              {drivers
                .filter((d) => d.status === 'on_duty' && d.metrics)
                .map((driver, index) => {
                  const top = 20 + (index * 15) % 60;
                  const left = 15 + (index * 25) % 70;

                  return (
                    <Link
                      key={driver.id}
                      href={`/dashboard/drivers/${driver.id}`}
                    >
                      <motion.div
                        className="absolute cursor-pointer group"
                        style={{ top: `${top}%`, left: `${left}%` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            driver.metrics?.fatigue_level === 'Critical'
                              ? 'bg-red-500 border-red-400'
                              : driver.metrics?.fatigue_level === 'Moderate'
                              ? 'bg-orange-500 border-orange-400'
                              : driver.metrics?.fatigue_level === 'Mild'
                              ? 'bg-yellow-500 border-yellow-400'
                              : 'bg-green-500 border-green-400'
                          } shadow-lg`}
                        >
                          <Truck className="w-5 h-5 text-white" />
                        </div>

                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 w-48">
                          <p className="font-semibold text-white text-sm mb-1">
                            {driver.name}
                          </p>
                          <p className="text-xs text-slate-400 mb-2">
                            {driver.vehicle?.plate_number || 'No vehicle'}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Alertness:</span>
                              <span
                                className={getFatigueLevelColor(
                                  driver.metrics?.fatigue_level
                                )}
                              >
                                {driver.metrics?.alertness_score}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">Speed:</span>
                              <span className="text-slate-300">
                                {driver.metrics?.speed} km/h
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 rounded-lg p-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-300">Alert</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-slate-300">Mild Fatigue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-slate-300">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-300">Critical</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            Active Drivers
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {drivers
              .filter((d) => d.status === 'on_duty')
              .map((driver, index) => (
                <Link key={driver.id} href={`/dashboard/drivers/${driver.id}`}>
                  <motion.div
                    className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {driver.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {driver.vehicle?.plate_number || 'No vehicle assigned'}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${getStatusColor(driver.status)}`}
                      >
                        {driver.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {driver.metrics && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Alertness:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  driver.metrics.alertness_score >= 80
                                    ? 'bg-green-500'
                                    : driver.metrics.alertness_score >= 60
                                    ? 'bg-yellow-500'
                                    : driver.metrics.alertness_score >= 40
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                                }`}
                                style={{
                                  width: `${driver.metrics.alertness_score}%`,
                                }}
                              ></div>
                            </div>
                            <span
                              className={getFatigueLevelColor(
                                driver.metrics.fatigue_level
                              )}
                            >
                              {driver.metrics.alertness_score}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Speed:</span>
                          <span className="text-slate-300">
                            {driver.metrics.speed} km/h
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </Link>
              ))}
          </div>
        </Card>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
