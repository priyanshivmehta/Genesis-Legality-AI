'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Gauge,
  Navigation,
  Eye,
  AlertCircle,
  TrendingUp,
  Coffee,
  Clock,
  Phone,
  Mail,
  CreditCard,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Wind,
  Route,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/project/components/ui/button';
import { Card } from '@/project/components/ui/card';
import { Badge } from '@/project/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/project/components/ui/tabs';
import { supabase, Driver, RealTimeMetric, Alert as AlertType } from '@/project/lib/supabase';
import { updateDriverMetrics, predictFatigue } from '@/project/lib/fleetData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeMetric | null>(null);
  const [historicalMetrics, setHistoricalMetrics] = useState<RealTimeMetric[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [vehicle, setVehicle] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDriverData();
    const interval = setInterval(fetchDriverData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchDriverData = async () => {
    try {
      const [driverRes, metricsRes, alertsRes, assignmentRes] = await Promise.all([
        supabase.from('drivers').select('*').eq('id', id).maybeSingle(),
        supabase
          .from('real_time_metrics')
          .select('*')
          .eq('driver_id', id)
          .order('timestamp', { ascending: false })
          .limit(30),
        supabase
          .from('alerts')
          .select('*')
          .eq('driver_id', id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('driver_assignments')
          .select('*, vehicles(*)')
          .eq('driver_id', id)
          .eq('status', 'in_progress')
          .maybeSingle(),
      ]);

      if (driverRes.data) setDriver(driverRes.data);
      if (metricsRes.data) {
        setHistoricalMetrics(metricsRes.data);
        setCurrentMetrics(metricsRes.data[0] || null);
      }
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (assignmentRes.data?.vehicles) setVehicle(assignmentRes.data.vehicles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSimulateFatigue = async () => {
    if (!vehicle) return;
    await updateDriverMetrics(id, vehicle.id);
    await fetchDriverData();
  };

  const handleIncreaseSpeed = async () => {
    if (!currentMetrics || !vehicle) return;
    const newSpeed = Math.min(120, currentMetrics.speed + 15);
    await supabase.from('real_time_metrics').insert({
      driver_id: id,
      vehicle_id: vehicle.id,
      latitude: currentMetrics.latitude,
      longitude: currentMetrics.longitude,
      speed: newSpeed,
      steering_deviation: currentMetrics.steering_deviation,
      blink_rate: currentMetrics.blink_rate,
      alertness_score: Math.max(30, currentMetrics.alertness_score - 5),
      fatigue_level: currentMetrics.fatigue_level,
      timestamp: new Date().toISOString(),
    });

    if (newSpeed > 90) {
      await supabase.from('alerts').insert({
        driver_id: id,
        severity: 'warning',
        type: 'speed',
        message: `Speed increased to ${newSpeed} km/h - Above safe limit`,
        acknowledged: false,
      });
    }

    await fetchDriverData();
  };

  const handleSimulateDrift = async () => {
    if (!currentMetrics || !vehicle) return;
    const newDeviation = Math.min(30, currentMetrics.steering_deviation + 8);
    await supabase.from('real_time_metrics').insert({
      driver_id: id,
      vehicle_id: vehicle.id,
      latitude: currentMetrics.latitude + (Math.random() - 0.5) * 0.01,
      longitude: currentMetrics.longitude + (Math.random() - 0.5) * 0.01,
      speed: currentMetrics.speed,
      steering_deviation: newDeviation,
      blink_rate: Math.max(5, currentMetrics.blink_rate - 3),
      alertness_score: Math.max(30, currentMetrics.alertness_score - 15),
      fatigue_level: 'Critical',
      timestamp: new Date().toISOString(),
    });

    await supabase.from('alerts').insert({
      driver_id: id,
      severity: 'critical',
      type: 'steering',
      message: 'Lane drift detected - Excessive steering deviation',
      acknowledged: false,
    });

    await fetchDriverData();
  };

  const handleChangeRoute = async () => {
    if (!vehicle || !currentMetrics) return;
    const cities = [
      { lat: 19.076, lng: 72.8777 },
      { lat: 28.7041, lng: 77.1025 },
      { lat: 12.9716, lng: 77.5946 },
      { lat: 17.385, lng: 78.4867 },
      { lat: 23.0225, lng: 72.5714 },
    ];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];

    await supabase.from('real_time_metrics').insert({
      driver_id: id,
      vehicle_id: vehicle.id,
      latitude: randomCity.lat,
      longitude: randomCity.lng,
      speed: currentMetrics.speed,
      steering_deviation: currentMetrics.steering_deviation,
      blink_rate: currentMetrics.blink_rate,
      alertness_score: currentMetrics.alertness_score,
      fatigue_level: currentMetrics.fatigue_level,
      timestamp: new Date().toISOString(),
    });

    await supabase.from('alerts').insert({
      driver_id: id,
      severity: 'info',
      type: 'system',
      message: 'Route updated - GPS recalibrated',
      acknowledged: false,
    });

    await fetchDriverData();
  };

  const handleReset = async () => {
    if (!vehicle) return;
    await supabase.from('real_time_metrics').insert({
      driver_id: id,
      vehicle_id: vehicle.id,
      latitude: 19.076 + (Math.random() - 0.5) * 0.1,
      longitude: 72.8777 + (Math.random() - 0.5) * 0.1,
      speed: 45,
      steering_deviation: 2,
      blink_rate: 17,
      alertness_score: 85,
      fatigue_level: 'Alert',
      timestamp: new Date().toISOString(),
    });

    await supabase.from('alerts').insert({
      driver_id: id,
      severity: 'info',
      type: 'system',
      message: 'All metrics reset to baseline',
      acknowledged: false,
    });

    await fetchDriverData();
  };

  const getFatigueLevelColor = (level?: string) => {
    switch (level) {
      case 'Alert':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'Mild':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'Moderate':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'Critical':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const chartData = historicalMetrics
    .slice()
    .reverse()
    .slice(0, 20)
    .map((metric) => ({
      time: new Date(metric.timestamp).toLocaleTimeString().slice(0, 5),
      alertness: metric.alertness_score,
      speed: metric.speed,
      blinkRate: metric.blink_rate,
      steering: metric.steering_deviation,
    }));

  if (loading && !driver) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-slate-400">Driver not found</p>
          <Link href="/dashboard/drivers">
            <Button className="mt-4">Back to Drivers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/drivers">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-700 hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
              {driver.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{driver.name}</h1>
              <p className="text-slate-400">Real-time Driver Monitoring Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Alertness Score</p>
              <p className="text-4xl font-bold text-white">
                {currentMetrics?.alertness_score || 0}
              </p>
              <p className="text-xs text-slate-500">/ 100</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                (currentMetrics?.alertness_score || 0) >= 80
                  ? 'bg-green-500'
                  : (currentMetrics?.alertness_score || 0) >= 60
                  ? 'bg-yellow-500'
                  : (currentMetrics?.alertness_score || 0) >= 40
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${currentMetrics?.alertness_score || 0}%` }}
            ></div>
          </div>
          <Badge
            className={`mt-4 w-full justify-center py-2 ${getFatigueLevelColor(
              currentMetrics?.fatigue_level
            )}`}
          >
            {currentMetrics?.fatigue_level || 'Unknown'}
          </Badge>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Current Speed</p>
              <p className="text-4xl font-bold text-white">
                {currentMetrics?.speed || 0}
              </p>
              <p className="text-xs text-slate-500">km/h</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Gauge className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Speed limit: 80 km/h</p>
          {currentMetrics && currentMetrics.speed > 80 && (
            <Badge className="mt-2 bg-red-500/20 text-red-400">
              Above limit
            </Badge>
          )}
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Blink Rate</p>
              <p className="text-4xl font-bold text-white">
                {currentMetrics?.blink_rate || 0}
              </p>
              <p className="text-xs text-slate-500">per minute</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Normal: 15-20 bpm</p>
          {currentMetrics && (currentMetrics.blink_rate < 12 || currentMetrics.blink_rate > 25) && (
            <Badge className="mt-2 bg-yellow-500/20 text-yellow-400">
              Abnormal
            </Badge>
          )}
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Steering Deviation</p>
              <p className="text-4xl font-bold text-white">
                {currentMetrics?.steering_deviation || 0}°
              </p>
              <p className="text-xs text-slate-500">degrees</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Navigation className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-slate-500">Safe: ±5°</p>
          {currentMetrics && currentMetrics.steering_deviation > 10 && (
            <Badge className="mt-2 bg-red-500/20 text-red-400">
              Warning
            </Badge>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-6">Metrics Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAlertness" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="alertness"
                stroke="#10b981"
                strokeWidth={2}
                name="Alertness"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Speed"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="steering"
                stroke="#f97316"
                strokeWidth={2}
                name="Steering"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Driver Info</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="text-white text-sm ml-6">{driver.email}</p>
            </div>
            {driver.phone && (
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
                <p className="text-white text-sm ml-6">{driver.phone}</p>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <CreditCard className="w-4 h-4" />
                License
              </div>
              <p className="text-white text-sm ml-6">{driver.license_number}</p>
            </div>
            {vehicle && (
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Activity className="w-4 h-4" />
                  Vehicle
                </div>
                <p className="text-white text-sm ml-6 font-semibold">
                  {vehicle.plate_number}
                </p>
                <p className="text-slate-400 text-xs ml-6">
                  {vehicle.make} {vehicle.model}
                </p>
              </div>
            )}
            {currentMetrics && (
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Fatigue Time
                </div>
                <p className="text-white text-sm ml-6 font-semibold">
                  {predictFatigue(
                    currentMetrics.alertness_score,
                    currentMetrics.blink_rate,
                    currentMetrics.steering_deviation
                  )}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Simulation Controls</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSimulating(!isSimulating)}
            className="border-slate-700 hover:bg-slate-800"
          >
            {isSimulating ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button
            onClick={handleSimulateFatigue}
            disabled={!isSimulating}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            Fatigue
          </Button>

          <Button
            onClick={handleIncreaseSpeed}
            disabled={!isSimulating}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Speed Up
          </Button>

          <Button
            onClick={handleSimulateDrift}
            disabled={!isSimulating}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Wind className="w-4 h-4 mr-2" />
            Drift
          </Button>

          <Button
            onClick={handleChangeRoute}
            disabled={!isSimulating}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Route className="w-4 h-4 mr-2" />
            Change Route
          </Button>

          <Button
            onClick={handleReset}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Alert History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase">
                        {alert.severity} - {alert.type}
                      </span>
                    </div>
                    <span className="text-xs opacity-75">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-slate-400">No alerts</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Metrics Details</h3>
            <div className="space-y-4">
              {historicalMetrics.slice(0, 5).map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-white">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                    <Badge className={`${getFatigueLevelColor(metric.fatigue_level)}`}>
                      {metric.fatigue_level}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Alertness</span>
                      <p className="text-white font-semibold">
                        {metric.alertness_score}%
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Speed</span>
                      <p className="text-white font-semibold">
                        {metric.speed} km/h
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Blink Rate</span>
                      <p className="text-white font-semibold">
                        {metric.blink_rate} bpm
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Steering</span>
                      <p className="text-white font-semibold">
                        {metric.steering_deviation}°
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

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
