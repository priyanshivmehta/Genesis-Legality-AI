'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Database, Save } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
import { supabase } from '../../../lib/supabase';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    critical_alertness: 40,
    warning_alertness: 60,
    critical_blink_rate: 8,
    warning_blink_rate: 12,
    critical_steering: 30,
    warning_steering: 15,
    speed_limit_buffer: 10,
    audio_alerts: true,
    email_notifications: true,
    auto_refresh: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'alert_thresholds')
      .single();

    if (data?.value) {
      setSettings((prev) => ({ ...prev, ...data.value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);

    await supabase
      .from('system_settings')
      .upsert({
        key: 'alert_thresholds',
        value: settings,
        description: 'Alert threshold settings',
      });

    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-slate-400">Configure fleet management system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Alert Thresholds</h2>
              <p className="text-sm text-slate-400">Configure safety limits</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Critical Alertness
                </Label>
                <Input
                  type="number"
                  value={settings.critical_alertness}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      critical_alertness: parseInt(e.target.value),
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Warning Alertness
                </Label>
                <Input
                  type="number"
                  value={settings.warning_alertness}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      warning_alertness: parseInt(e.target.value),
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Critical Blink Rate
                </Label>
                <Input
                  type="number"
                  value={settings.critical_blink_rate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      critical_blink_rate: parseInt(e.target.value),
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Warning Blink Rate
                </Label>
                <Input
                  type="number"
                  value={settings.warning_blink_rate}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      warning_blink_rate: parseInt(e.target.value),
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Critical Steering (degrees)
                </Label>
                <Input
                  type="number"
                  value={settings.critical_steering}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      critical_steering: parseInt(e.target.value),
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Warning Steering (degrees)
                </Label>
                <Input
                  type="number"
                  value={settings.warning_steering}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      warning_steering: parseInt(e.target.value),
                    })
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">
                Speed Limit Buffer (km/h)
              </Label>
              <Input
                type="number"
                value={settings.speed_limit_buffer}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    speed_limit_buffer: parseInt(e.target.value),
                  })
                }
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-sm text-slate-400">Manage alert preferences</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Audio Alerts
                </h3>
                <p className="text-xs text-slate-400">
                  Play sound for critical alerts
                </p>
              </div>
              <Switch
                checked={settings.audio_alerts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, audio_alerts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Email Notifications
                </h3>
                <p className="text-xs text-slate-400">
                  Send alerts via email
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, email_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Auto Refresh
                </h3>
                <p className="text-xs text-slate-400">
                  Automatically update dashboard
                </p>
              </div>
              <Switch
                checked={settings.auto_refresh}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, auto_refresh: checked })
                }
              />
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">System Information</h2>
            <p className="text-sm text-slate-400">Application details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Version</p>
            <p className="text-lg font-semibold text-white">1.0.0</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Database Status</p>
            <p className="text-lg font-semibold text-green-400">Connected</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Last Updated</p>
            <p className="text-lg font-semibold text-white">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          {saving ? (
            'Saving...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
