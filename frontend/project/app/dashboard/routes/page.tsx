'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, Search, Edit, Trash2, Route as RouteIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase, Route } from '@/lib/supabase';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_location: '',
    end_location: '',
    distance_km: 0,
    estimated_duration_minutes: 0,
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const { data } = await supabase
      .from('routes')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setRoutes(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRoute) {
      await supabase.from('routes').update(formData).eq('id', editingRoute.id);
    } else {
      await supabase.from('routes').insert([{ ...formData, status: 'active' }]);
    }

    setDialogOpen(false);
    setEditingRoute(null);
    setFormData({
      name: '',
      start_location: '',
      end_location: '',
      distance_km: 0,
      estimated_duration_minutes: 0,
    });
    fetchRoutes();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to archive this route?')) {
      await supabase.from('routes').update({ status: 'archived' }).eq('id', id);
      fetchRoutes();
    }
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.end_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Route Management</h1>
          <p className="text-slate-400">Manage fleet routes</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-slate-300">Route Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Start Location</Label>
                <Input
                  value={formData.start_location}
                  onChange={(e) =>
                    setFormData({ ...formData, start_location: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">End Location</Label>
                <Input
                  value={formData.end_location}
                  onChange={(e) =>
                    setFormData({ ...formData, end_location: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Distance (km)</Label>
                  <Input
                    type="number"
                    value={formData.distance_km}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distance_km: parseFloat(e.target.value),
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Duration (min)</Label>
                  <Input
                    type="number"
                    value={formData.estimated_duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimated_duration_minutes: parseInt(e.target.value),
                      })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                {editingRoute ? 'Update Route' : 'Add Route'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-slate-900/50 border-slate-700 p-4 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                      <RouteIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{route.name}</h3>
                      <Badge className="text-xs bg-green-500/20 text-green-400">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-slate-300">
                      {route.start_location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-slate-300">
                      {route.end_location}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Distance:</span>
                      <span className="text-white ml-2">{route.distance_km} km</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white ml-2">
                        {Math.floor(route.estimated_duration_minutes / 60)}h{' '}
                        {route.estimated_duration_minutes % 60}m
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRoute(route);
                      setFormData({
                        name: route.name,
                        start_location: route.start_location,
                        end_location: route.end_location,
                        distance_km: route.distance_km,
                        estimated_duration_minutes: route.estimated_duration_minutes,
                      });
                      setDialogOpen(true);
                    }}
                    className="flex-1 border-slate-700 hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(route.id)}
                    className="border-red-500/50 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
