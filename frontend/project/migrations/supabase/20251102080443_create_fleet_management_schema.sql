/*
  # Fleet Management System Schema

  ## Overview
  Complete database schema for fleet management system with drivers, vehicles, routes, and real-time monitoring.

  ## New Tables
  
  ### `drivers`
  - `id` (uuid, primary key) - Unique driver identifier
  - `name` (text) - Full driver name
  - `email` (text, unique) - Contact email
  - `phone` (text) - Contact phone number
  - `license_number` (text, unique) - Driver's license
  - `status` (text) - Current status: active, inactive, on_duty, off_duty
  - `profile_image` (text) - URL to profile image
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `vehicles`
  - `id` (uuid, primary key) - Unique vehicle identifier
  - `plate_number` (text, unique) - License plate
  - `make` (text) - Vehicle manufacturer
  - `model` (text) - Vehicle model
  - `year` (integer) - Manufacturing year
  - `status` (text) - Status: available, in_use, maintenance, decommissioned
  - `fuel_level` (numeric) - Current fuel percentage
  - `mileage` (numeric) - Total kilometers driven
  - `last_maintenance` (date) - Last maintenance date
  - `next_maintenance` (date) - Scheduled maintenance date
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `routes`
  - `id` (uuid, primary key) - Unique route identifier
  - `name` (text) - Route name
  - `start_location` (text) - Starting point
  - `end_location` (text) - Destination
  - `waypoints` (jsonb) - Array of GPS coordinates
  - `distance_km` (numeric) - Total distance
  - `estimated_duration_minutes` (integer) - Expected travel time
  - `status` (text) - Status: active, archived
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `driver_assignments`
  - `id` (uuid, primary key) - Assignment identifier
  - `driver_id` (uuid, foreign key) - Reference to driver
  - `vehicle_id` (uuid, foreign key) - Reference to vehicle
  - `route_id` (uuid, foreign key) - Reference to route
  - `start_time` (timestamptz) - Trip start time
  - `end_time` (timestamptz) - Trip end time (null if ongoing)
  - `status` (text) - Status: scheduled, in_progress, completed, cancelled
  - `created_at` (timestamptz) - Record creation timestamp

  ### `real_time_metrics`
  - `id` (uuid, primary key) - Metric identifier
  - `driver_id` (uuid, foreign key) - Reference to driver
  - `vehicle_id` (uuid, foreign key) - Reference to vehicle
  - `latitude` (numeric) - GPS latitude
  - `longitude` (numeric) - GPS longitude
  - `speed` (numeric) - Current speed in km/h
  - `steering_deviation` (numeric) - Steering angle deviation
  - `blink_rate` (numeric) - Blinks per minute
  - `alertness_score` (numeric) - Score 0-100
  - `fatigue_level` (text) - Level: Alert, Mild, Moderate, Critical
  - `timestamp` (timestamptz) - Measurement timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### `alerts`
  - `id` (uuid, primary key) - Alert identifier
  - `driver_id` (uuid, foreign key) - Reference to driver
  - `severity` (text) - Severity: info, warning, critical
  - `type` (text) - Type: fatigue, speed, steering, system
  - `message` (text) - Alert message
  - `acknowledged` (boolean) - Whether alert was acknowledged
  - `acknowledged_at` (timestamptz) - Acknowledgment timestamp
  - `acknowledged_by` (uuid) - User who acknowledged (if applicable)
  - `created_at` (timestamptz) - Alert creation timestamp

  ### `reports`
  - `id` (uuid, primary key) - Report identifier
  - `type` (text) - Type: driver, fleet, route, custom
  - `driver_id` (uuid, foreign key, nullable) - Specific driver if applicable
  - `date_from` (date) - Report start date
  - `date_to` (date) - Report end date
  - `data` (jsonb) - Report data and metrics
  - `generated_by` (text) - User who generated report
  - `created_at` (timestamptz) - Report generation timestamp

  ### `system_settings`
  - `id` (uuid, primary key) - Setting identifier
  - `key` (text, unique) - Setting key
  - `value` (jsonb) - Setting value
  - `description` (text) - Setting description
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for demonstration purposes
  - In production, would restrict based on user roles
*/

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  license_number text UNIQUE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_duty', 'off_duty')),
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text UNIQUE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'decommissioned')),
  fuel_level numeric DEFAULT 100 CHECK (fuel_level >= 0 AND fuel_level <= 100),
  mileage numeric DEFAULT 0,
  last_maintenance date,
  next_maintenance date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_location text NOT NULL,
  end_location text NOT NULL,
  waypoints jsonb DEFAULT '[]'::jsonb,
  distance_km numeric,
  estimated_duration_minutes integer,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create driver_assignments table
CREATE TABLE IF NOT EXISTS driver_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  route_id uuid REFERENCES routes(id) ON DELETE SET NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create real_time_metrics table
CREATE TABLE IF NOT EXISTS real_time_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  speed numeric DEFAULT 0,
  steering_deviation numeric DEFAULT 0,
  blink_rate numeric DEFAULT 15,
  alertness_score numeric DEFAULT 100 CHECK (alertness_score >= 0 AND alertness_score <= 100),
  fatigue_level text DEFAULT 'Alert' CHECK (fatigue_level IN ('Alert', 'Mild', 'Moderate', 'Critical')),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  type text NOT NULL CHECK (type IN ('fatigue', 'speed', 'steering', 'system')),
  message text NOT NULL,
  acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('driver', 'fleet', 'route', 'custom')),
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  date_from date NOT NULL,
  date_to date NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  generated_by text,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver_id ON driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_status ON driver_assignments(status);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_driver_id ON real_time_metrics(driver_id);
CREATE INDEX IF NOT EXISTS idx_real_time_metrics_timestamp ON real_time_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_driver_id ON alerts(driver_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);

-- Enable Row Level Security
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_time_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for demonstration (in production, restrict by user roles)
CREATE POLICY "Allow public read access to drivers"
  ON drivers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to drivers"
  ON drivers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to drivers"
  ON drivers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to drivers"
  ON drivers FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to vehicles"
  ON vehicles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to vehicles"
  ON vehicles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to vehicles"
  ON vehicles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to vehicles"
  ON vehicles FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to routes"
  ON routes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to routes"
  ON routes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to routes"
  ON routes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to routes"
  ON routes FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to driver_assignments"
  ON driver_assignments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to driver_assignments"
  ON driver_assignments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to driver_assignments"
  ON driver_assignments FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to driver_assignments"
  ON driver_assignments FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to real_time_metrics"
  ON real_time_metrics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to real_time_metrics"
  ON real_time_metrics FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to real_time_metrics"
  ON real_time_metrics FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to real_time_metrics"
  ON real_time_metrics FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to alerts"
  ON alerts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to alerts"
  ON alerts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to alerts"
  ON alerts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to alerts"
  ON alerts FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to reports"
  ON reports FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to reports"
  ON reports FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to reports"
  ON reports FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to reports"
  ON reports FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to system_settings"
  ON system_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to system_settings"
  ON system_settings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to system_settings"
  ON system_settings FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to system_settings"
  ON system_settings FOR DELETE
  TO public
  USING (true);