'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Truck,
  MapPin,
  AlertCircle,
  FileText,
  Settings,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { supabase } from '../../lib/supabase';
import { seedInitialData } from '../../lib/fleetData';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [unacknowledgedAlerts, setUnacknowledgedAlerts] = useState(0);

  useEffect(() => {
    seedInitialData();

    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('id')
        .eq('acknowledged', false);
      setUnacknowledgedAlerts(data?.length || 0);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const navigation = [
    {
      name: 'Fleet Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    { name: 'Drivers', href: '/dashboard/drivers', icon: Users },
    { name: 'Vehicles', href: '/dashboard/vehicles', icon: Truck },
    { name: 'Routes', href: '/dashboard/routes', icon: MapPin },
    { name: 'Alerts', href: '/dashboard/alerts', icon: AlertCircle },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div
        className={`fixed inset-y-0 left-0 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-cyan-400" />
                <span className="text-lg font-bold text-white">FleetPro</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isCurrentPage = isActive(item.href, item.exact);
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isCurrentPage
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                    {item.name === 'Alerts' &&
                      unacknowledgedAlerts > 0 &&
                      sidebarOpen && (
                        <Badge
                          variant="destructive"
                          className="ml-auto text-xs"
                        >
                          {unacknowledgedAlerts}
                        </Badge>
                      )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full text-slate-400 hover:text-white"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {sidebarOpen && <span className="ml-2">Toggle Theme</span>}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`${
          sidebarOpen ? 'ml-64' : 'ml-20'
        } transition-all duration-300`}
      >
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Fleet Management System
              </h1>
              <p className="text-sm text-slate-400">
                Real-time monitoring and control
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-400 hover:text-white"
              >
                <Bell className="w-5 h-5" />
                {unacknowledgedAlerts > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Button>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AD</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">Admin User</div>
                  <div className="text-slate-400">Fleet Manager</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
