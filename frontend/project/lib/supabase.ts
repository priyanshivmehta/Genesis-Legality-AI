import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  license_number: string;
  status: 'active' | 'inactive' | 'on_duty' | 'off_duty';
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  year: number;
  status: 'available' | 'in_use' | 'maintenance' | 'decommissioned';
  fuel_level: number;
  mileage: number;
  last_maintenance: string | null;
  next_maintenance: string | null;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  waypoints: any[];
  distance_km: number;
  estimated_duration_minutes: number;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface DriverAssignment {
  id: string;
  driver_id: string;
  vehicle_id: string;
  route_id: string | null;
  start_time: string;
  end_time: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface RealTimeMetric {
  id: string;
  driver_id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  steering_deviation: number;
  blink_rate: number;
  alertness_score: number;
  fatigue_level: 'Alert' | 'Mild' | 'Moderate' | 'Critical';
  timestamp: string;
  created_at: string;
}

export interface Alert {
  id: string;
  driver_id: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'fatigue' | 'speed' | 'steering' | 'system';
  message: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  created_at: string;
}
