'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Fuel,
  Gauge,
  Calendar,
  Wrench,
} from 'lucide-react';
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline';
    size?: 'sm' | 'md' | 'lg';
  }
> = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline'; size?: 'sm' | 'md' | 'lg' }>(
  ({ className = '', variant = 'default', size = 'md', children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md';
    const variants: Record<string, string> = {
      default: 'bg-slate-700 text-white',
      outline: 'bg-transparent border border-slate-700 text-white',
    };
    const sizes: Record<string, string> = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2',
    };
    const cls = [base, variants[variant] || '', sizes[size] || '', className].join(' ').trim();
    return (
      <button ref={ref} className={cls} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
// removed import of Input because a local Input component is declared below
// Local Badge component to avoid missing import
const Badge: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium border ${className}`}
    >
      {children}
    </span>
  );
};
// Simple local Dialog components to avoid missing import
// These implement minimal behavior expected by this page: controlled open state
// via the Dialog component's props and a Trigger that calls onOpenChange.
type DialogContextValue = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};
const DialogContext = React.createContext<DialogContextValue>({});

export const Dialog: React.FC<
  React.PropsWithChildren<{ open?: boolean; onOpenChange?: (v: boolean) => void }>
> = ({ children, open, onOpenChange }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }> = ({
  asChild,
  children,
}) => {
  const ctx = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement;
    const onClick = (e: any) => {
      child.props.onClick?.(e);
      ctx.onOpenChange?.(true);
    };
    return React.cloneElement(child, { onClick });
  }
  return <button onClick={() => ctx.onOpenChange?.(true)}>{children}</button>;
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx.open) return null;
  return (
    <div {...props} className={className}>
      {children}
    </div>
  );
};

export const DialogHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className="dialog-header">{children}</div>;
};

export const DialogTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = '',
}) => {
  return <h2 className={`dialog-title ${className}`.trim()}>{children}</h2>;
};
// Local Label component to replace missing import
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <label {...props} className={`block text-sm font-medium ${className}`}>
      {children}
    </label>
  );
};
// Minimal local Select components to avoid missing import
// Local minimal supabase-like stub and Vehicle type to replace the missing external module.
// This is intended for local/dev usage so the page compiles and the UI works without the real client.
export type Vehicle = {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  status: 'available' | 'in_use' | 'maintenance' | 'decommissioned';
  fuel_level: number;
  mileage: number;
  next_maintenance?: string | null;
  created_at?: string | null;
};

const mockVehicles: Vehicle[] = [];

// Minimal supabase-like API surface used by this page
export const supabase = {
  from: (table: string) => {
    return {
      select: (cols?: string) => Promise.resolve({ data: [...mockVehicles] }),
      // order returns an object that still supports select to match usage in the file
      order: (col: string, _opts?: any) => ({
        select: (cols?: string) => Promise.resolve({ data: [...mockVehicles] }),
      }),
      insert: async (rows: Partial<Vehicle>[]) => {
        const inserted = rows.map((r) => ({
          id: (Date.now() + Math.random()).toString(),
          created_at: new Date().toISOString(),
          plate_number: r.plate_number ?? '',
          make: r.make ?? '',
          model: r.model ?? '',
          year: r.year ?? new Date().getFullYear(),
          status: (r.status as Vehicle['status']) ?? 'available',
          fuel_level: r.fuel_level ?? 100,
          mileage: r.mileage ?? 0,
          next_maintenance: r.next_maintenance ?? null,
        })) as Vehicle[];
        mockVehicles.unshift(...inserted);
        return { data: inserted };
      },
      update: (row: Partial<Vehicle>) => ({
        eq: async (field: string, value: any) => {
          const idx = mockVehicles.findIndex((v) => (v as any)[field] === value);
          if (idx !== -1) {
            mockVehicles[idx] = { ...mockVehicles[idx], ...row } as Vehicle;
            return { data: [mockVehicles[idx]] };
          }
          return { data: null };
        },
      }),
      delete: () => ({
        eq: async (field: string, value: any) => {
          const idx = mockVehicles.findIndex((v) => (v as any)[field] === value);
          if (idx !== -1) {
            const removed = mockVehicles.splice(idx, 1);
            return { data: removed };
          }
          return { data: null };
        },
      }),
    };
  },
};

type SelectContextType = {
  value?: any;
  onValueChange?: (v: any) => void;
  open?: boolean;
  setOpen?: (o: boolean) => void;
};
const SelectContext = React.createContext<SelectContextType>({});

export const Select: React.FC<
  React.PropsWithChildren<{ value?: any; onValueChange?: (v: any) => void }>
> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      {children}
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }> = ({
  children,
  className = '',
  ...props
}) => {
  const ctx = React.useContext(SelectContext);
  const { open, setOpen } = ctx;
  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        setOpen && setOpen(!open);
      }}
      className={className}
    >
      {children}
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const ctx = React.useContext(SelectContext);
  return <span>{ctx.value ?? placeholder ?? ''}</span>;
};

export const SelectContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => {
  const ctx = React.useContext(SelectContext);
  if (!ctx.open) return null;
  return <div className={className}>{children}</div>;
};

export const SelectItem: React.FC<
  React.PropsWithChildren<{ value: any; className?: string }>
> = ({ children, value, className = '' }) => {
  const ctx = React.useContext(SelectContext);
  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      onClick={() => {
        ctx.onValueChange && ctx.onValueChange(value);
        ctx.setOpen && ctx.setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          ctx.onValueChange && ctx.onValueChange(value);
          ctx.setOpen && ctx.setOpen(false);
        }
      }}
    >
      {children}
    </div>
  );
};

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return <input ref={ref} className={className} {...props} />;
  }
);
Input.displayName = 'Input';

const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div {...props} className={`rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'available' as Vehicle['status'],
    fuel_level: 100,
    mileage: 0,
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from('vehicles')
      .order('created_at', { ascending: false })
      .select('*');
    setVehicles(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVehicle) {
      await supabase
        .from('vehicles')
        .update(formData)
        .eq('id', editingVehicle.id);
    } else {
      await supabase.from('vehicles').insert([formData]);
    }

    setDialogOpen(false);
    setEditingVehicle(null);
    setFormData({
      plate_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      status: 'available',
      fuel_level: 100,
      mileage: 0,
    });
    fetchVehicles();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate_number: vehicle.plate_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      status: vehicle.status,
      fuel_level: vehicle.fuel_level,
      mileage: vehicle.mileage,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      await supabase.from('vehicles').delete().eq('id', id);
      fetchVehicles();
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_use':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'available':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'maintenance':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'decommissioned':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level >= 60) return 'text-green-400';
    if (level >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Vehicle Management</h1>
          <p className="text-slate-400">Manage your fleet vehicles</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              onClick={() => {
                setEditingVehicle(null);
                setFormData({
                  plate_number: '',
                  make: '',
                  model: '',
                  year: new Date().getFullYear(),
                  status: 'available',
                  fuel_level: 100,
                  mileage: 0,
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="plate" className="text-slate-300">
                  Plate Number
                </Label>
                <Input
                  id="plate"
                  value={formData.plate_number}
                  onChange={(e) =>
                    setFormData({ ...formData, plate_number: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make" className="text-slate-300">
                    Make
                  </Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) =>
                      setFormData({ ...formData, make: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model" className="text-slate-300">
                    Model
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="year" className="text-slate-300">
                  Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-slate-300">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Vehicle['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_use">In Use</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="decommissioned">Decommissioned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fuel" className="text-slate-300">
                  Fuel Level (%)
                </Label>
                <Input
                  id="fuel"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fuel_level}
                  onChange={(e) =>
                    setFormData({ ...formData, fuel_level: parseInt(e.target.value) })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mileage" className="text-slate-300">
                  Mileage (km)
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) =>
                    setFormData({ ...formData, mileage: parseInt(e.target.value) })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="decommissioned">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-slate-900/50 border-slate-700 p-4 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {vehicle.plate_number}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Fuel className="w-4 h-4" />
                      <span>Fuel</span>
                    </div>
                    <span className={getFuelLevelColor(vehicle.fuel_level)}>
                      {vehicle.fuel_level}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        vehicle.fuel_level >= 60
                          ? 'bg-green-500'
                          : vehicle.fuel_level >= 30
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${vehicle.fuel_level}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Gauge className="w-4 h-4" />
                      <span>Mileage</span>
                    </div>
                    <span className="text-slate-300">
                      {vehicle.mileage.toLocaleString()} km
                    </span>
                  </div>

                  {vehicle.next_maintenance && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Wrench className="w-4 h-4" />
                        <span>Next Service</span>
                      </div>
                      <span className="text-slate-300">
                        {new Date(vehicle.next_maintenance).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(vehicle)}
                    className="flex-1 border-slate-700 hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(vehicle.id)}
                    className="border-red-500/50 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No vehicles found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
