'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Bell, Filter } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/project/components/ui/card';
import { Button } from '@/project/components/ui/button';
import { Badge } from '@/project/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/project/components/ui/select';
import { supabase, Alert, Driver } from '@/project/lib/supabase';

interface AlertWithDriver extends Alert {
  driver?: Driver;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertWithDriver[]>([]);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterAcknowledged, setFilterAcknowledged] = useState('unacknowledged');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    const { data: alertsData } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (alertsData) {
      const driverIds = Array.from(new Set(alertsData.map((a) => a.driver_id)));
      const { data: driversData } = await supabase
        .from('drivers')
        .select('*')
        .in('id', driverIds);

      const driversMap = new Map(
        driversData?.map((d) => [d.id, d]) || []
      );

      const enrichedAlerts = alertsData.map((alert) => ({
        ...alert,
        driver: driversMap.get(alert.driver_id),
      }));

      setAlerts(enrichedAlerts);
    }
  };

  const handleAcknowledge = async (id: string) => {
    await supabase
      .from('alerts')
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq('id', id);
    fetchAlerts();
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity =
      filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesAcknowledged =
      filterAcknowledged === 'all' ||
      (filterAcknowledged === 'acknowledged' && alert.acknowledged) ||
      (filterAcknowledged === 'unacknowledged' && !alert.acknowledged);
    return matchesSeverity && matchesAcknowledged;
  });

  const getSeverityColor = (severity: string) => {
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

  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical' && !a.acknowledged)
      .length,
    warning: alerts.filter((a) => a.severity === 'warning' && !a.acknowledged)
      .length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Alert Management</h1>
        <p className="text-slate-400">Monitor and manage fleet alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Alerts</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Critical</p>
              <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Warnings</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.warning}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Unacknowledged</p>
              <p className="text-2xl font-bold text-orange-400">
                {stats.unacknowledged}
              </p>
            </div>
            <Bell className="w-8 h-8 text-orange-400" />
          </div>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAcknowledged} onValueChange={setFilterAcknowledged}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${
                alert.acknowledged ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </Badge>
                    <Badge className="text-xs bg-slate-700 text-slate-300">
                      {alert.type}
                    </Badge>
                    {alert.acknowledged && (
                      <Badge className="text-xs bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-white mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {alert.driver && (
                      <Link
                        href={`/dashboard/drivers/${alert.driver.id}`}
                        className="hover:text-cyan-400 transition-colors"
                      >
                        Driver: {alert.driver.name}
                      </Link>
                    )}
                    <span>
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <Button
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            </motion.div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No alerts found</p>
            </div>
          )}
        </div>
      </Card>

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
      `}</style>
    </div>
  );
}
