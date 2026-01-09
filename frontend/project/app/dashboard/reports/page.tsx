'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase, Driver } from '@/lib/supabase';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('fleet');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [dateRange, setDateRange] = useState('7');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const { data } = await supabase.from('drivers').select('*').order('name');
    setDrivers(data || []);
  };

  const generateReport = async () => {
    setGenerating(true);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const reportData = {
      type: reportType,
      driver_id: reportType === 'driver' ? selectedDriver : null,
      date_from: startDate.toISOString().split('T')[0],
      date_to: endDate.toISOString().split('T')[0],
      data: {},
      generated_by: 'Admin User',
    };

    if (reportType === 'driver' && selectedDriver) {
      const [metricsRes, alertsRes] = await Promise.all([
        supabase
          .from('real_time_metrics')
          .select('*')
          .eq('driver_id', selectedDriver)
          .gte('timestamp', startDate.toISOString()),
        supabase
          .from('alerts')
          .select('*')
          .eq('driver_id', selectedDriver)
          .gte('created_at', startDate.toISOString()),
      ]);

      const metrics = metricsRes.data || [];
      const alerts = alertsRes.data || [];

      reportData.data = {
        total_trips: metrics.length,
        average_alertness:
          metrics.reduce((sum, m) => sum + m.alertness_score, 0) / metrics.length || 0,
        total_alerts: alerts.length,
        critical_alerts: alerts.filter((a) => a.severity === 'critical').length,
        average_speed:
          metrics.reduce((sum, m) => sum + m.speed, 0) / metrics.length || 0,
      };
    } else if (reportType === 'fleet') {
      const [driversRes, alertsRes, metricsRes] = await Promise.all([
        supabase.from('drivers').select('*'),
        supabase
          .from('alerts')
          .select('*')
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('real_time_metrics')
          .select('*')
          .gte('timestamp', startDate.toISOString()),
      ]);

      reportData.data = {
        total_drivers: driversRes.data?.length || 0,
        active_drivers:
          driversRes.data?.filter((d) => d.status === 'on_duty').length || 0,
        total_alerts: alertsRes.data?.length || 0,
        critical_alerts:
          alertsRes.data?.filter((a) => a.severity === 'critical').length || 0,
        average_alertness:
          metricsRes.data?.reduce((sum, m) => sum + m.alertness_score, 0) /
            (metricsRes.data?.length || 1) || 0,
      };
    }

    await supabase.from('reports').insert([reportData]);

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setGenerating(false), 1000);
  };

  const reportTemplates = [
    {
      name: 'Fleet Overview',
      type: 'fleet',
      description: 'Comprehensive fleet performance and statistics',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Driver Performance',
      type: 'driver',
      description: 'Individual driver metrics and behavior analysis',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Safety Report',
      type: 'safety',
      description: 'Alert analysis and safety incidents',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
    },
    {
      name: 'Route Analytics',
      type: 'route',
      description: 'Route efficiency and performance metrics',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Report Generation</h1>
        <p className="text-slate-400">Generate comprehensive fleet reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates.map((template, index) => (
          <motion.div
            key={template.type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`bg-slate-800/50 border-slate-700 p-6 cursor-pointer hover:border-cyan-500/50 transition-colors ${
                reportType === template.type ? 'border-cyan-500' : ''
              }`}
              onClick={() => setReportType(template.type)}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}
              >
                <template.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-slate-400">{template.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <Label className="text-slate-300 mb-2 block">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="fleet">Fleet Overview</SelectItem>
                <SelectItem value="driver">Driver Performance</SelectItem>
                <SelectItem value="safety">Safety Report</SelectItem>
                <SelectItem value="route">Route Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reportType === 'driver' && (
            <div>
              <Label className="text-slate-300 mb-2 block">Select Driver</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-slate-300 mb-2 block">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            Report will be generated as JSON format
          </div>
          <Button
            onClick={generateReport}
            disabled={generating || (reportType === 'driver' && !selectedDriver)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {generating ? (
              'Generating...'
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Report Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Performance Metrics
              </h3>
              <p className="text-xs text-slate-400">
                Detailed analysis of driver alertness, speed, and behavior patterns
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Safety Analytics
              </h3>
              <p className="text-xs text-slate-400">
                Comprehensive alert tracking and incident analysis
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Historical Data
              </h3>
              <p className="text-xs text-slate-400">
                Trend analysis with customizable date ranges
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Export Options
              </h3>
              <p className="text-xs text-slate-400">
                Download reports in JSON format for further analysis
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
