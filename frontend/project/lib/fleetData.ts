import { supabase, Driver, Vehicle, Route, RealTimeMetric } from './supabase';

export const indianCities = [
  { name: 'Mumbai, Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Bangalore, Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad, Telangana', lat: 17.385, lng: 78.4867 },
  { name: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata, West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 },
];

export const driverNames = [
  'Rajesh Kumar',
  'Priya Sharma',
  'Amit Patel',
  'Sneha Reddy',
  'Vikram Singh',
  'Anita Desai',
  'Ravi Verma',
  'Kavita Menon',
  'Suresh Nair',
  'Deepa Iyer',
];

export function calculateAlertnessScore(
  blinkRate: number,
  steeringDeviation: number,
  speed: number
): number {
  const blinkScore = Math.min(100, (blinkRate / 18) * 40);
  const steeringScore = Math.max(0, 40 - Math.abs(steeringDeviation) * 2);
  const speedScore = speed > 90 ? 10 : 20;
  return Math.round(blinkScore + steeringScore + speedScore);
}

export function calculateFatigueLevel(alertness: number): 'Alert' | 'Mild' | 'Moderate' | 'Critical' {
  if (alertness >= 80) return 'Alert';
  if (alertness >= 60) return 'Mild';
  if (alertness >= 40) return 'Moderate';
  return 'Critical';
}

export function predictFatigue(
  alertness: number,
  blinkRate: number,
  steeringDeviation: number
): string {
  const fatigueScore =
    (100 - alertness) + (20 - blinkRate) * 2 + Math.abs(steeringDeviation) * 3;

  if (fatigueScore < 20) return '> 30 min';
  if (fatigueScore < 40) return '15-30 min';
  if (fatigueScore < 60) return '5-15 min';
  return '< 5 min';
}

export function generateRealisticMetrics(previousMetrics?: Partial<RealTimeMetric>) {
  const baseSpeed = previousMetrics?.speed || Math.random() * 60 + 40;
  const baseAlertness = previousMetrics?.alertness_score || Math.random() * 30 + 60;
  const baseBlinkRate = previousMetrics?.blink_rate || Math.random() * 8 + 12;
  const baseSteeringDeviation = previousMetrics?.steering_deviation || Math.random() * 4 + 1;

  const speed = Math.max(0, Math.min(120, baseSpeed + (Math.random() - 0.5) * 10));
  const alertness = Math.max(30, Math.min(100, baseAlertness + (Math.random() - 0.5) * 10));
  const blinkRate = Math.max(5, Math.min(25, baseBlinkRate + (Math.random() - 0.5) * 3));
  const steeringDeviation = Math.max(
    0,
    Math.min(45, baseSteeringDeviation + (Math.random() - 0.5) * 5)
  );

  return {
    speed: Math.round(speed),
    alertness_score: Math.round(alertness),
    blink_rate: Math.round(blinkRate),
    steering_deviation: Number(steeringDeviation.toFixed(1)),
    fatigue_level: calculateFatigueLevel(alertness),
  };
}

export async function seedInitialData() {
  try {
    const { data: existingDrivers } = await supabase
      .from('drivers')
      .select('id')
      .limit(1);

    if (existingDrivers && existingDrivers.length > 0) {
      return;
    }

    const drivers = [];
    for (let i = 0; i < 10; i++) {
      drivers.push({
        name: driverNames[i],
        email: `${driverNames[i].toLowerCase().replace(/\s+/g, '.')}@fleet.com`,
        phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        license_number: `DL-${Math.floor(Math.random() * 90000) + 10000}`,
        status: i < 6 ? 'on_duty' : 'off_duty',
      });
    }

    const { data: insertedDrivers } = await supabase
      .from('drivers')
      .insert(drivers)
      .select();

    const vehicles = [];
    const makes = ['Tata', 'Mahindra', 'Ashok Leyland', 'Eicher', 'BharatBenz'];
    const models = ['Prima', 'Blazo', 'Dost', 'Partner', 'Ace'];

    for (let i = 0; i < 10; i++) {
      vehicles.push({
        plate_number: `MH-${Math.floor(Math.random() * 90) + 10}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 9000) + 1000}`,
        make: makes[Math.floor(Math.random() * makes.length)],
        model: models[Math.floor(Math.random() * models.length)],
        year: 2018 + Math.floor(Math.random() * 6),
        status: i < 6 ? 'in_use' : 'available',
        fuel_level: Math.floor(Math.random() * 50) + 50,
        mileage: Math.floor(Math.random() * 100000) + 50000,
        last_maintenance: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        next_maintenance: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      });
    }

    const { data: insertedVehicles } = await supabase
      .from('vehicles')
      .insert(vehicles)
      .select();

    const routes = [];
    for (let i = 0; i < 5; i++) {
      const start = indianCities[i];
      const end = indianCities[(i + 3) % indianCities.length];
      routes.push({
        name: `${start.name.split(',')[0]} to ${end.name.split(',')[0]} Route`,
        start_location: start.name,
        end_location: end.name,
        waypoints: [
          { lat: start.lat, lng: start.lng },
          { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 },
          { lat: end.lat, lng: end.lng },
        ],
        distance_km: Math.floor(Math.random() * 500) + 100,
        estimated_duration_minutes: Math.floor(Math.random() * 600) + 120,
        status: 'active',
      });
    }

    const { data: insertedRoutes } = await supabase
      .from('routes')
      .insert(routes)
      .select();

    if (insertedDrivers && insertedVehicles && insertedRoutes) {
      const assignments = [];
      for (let i = 0; i < 6; i++) {
        assignments.push({
          driver_id: insertedDrivers[i].id,
          vehicle_id: insertedVehicles[i].id,
          route_id: insertedRoutes[i % insertedRoutes.length].id,
          start_time: new Date().toISOString(),
          status: 'in_progress',
        });
      }

      await supabase.from('driver_assignments').insert(assignments);

      const metrics = [];
      for (let i = 0; i < 6; i++) {
        const city = indianCities[i];
        const generatedMetrics = generateRealisticMetrics();
        metrics.push({
          driver_id: insertedDrivers[i].id,
          vehicle_id: insertedVehicles[i].id,
          latitude: city.lat + (Math.random() - 0.5) * 0.1,
          longitude: city.lng + (Math.random() - 0.5) * 0.1,
          ...generatedMetrics,
          timestamp: new Date().toISOString(),
        });
      }

      await supabase.from('real_time_metrics').insert(metrics);
    }

    await supabase.from('system_settings').insert([
      {
        key: 'alert_thresholds',
        value: {
          critical_alertness: 40,
          warning_alertness: 60,
          critical_blink_rate: 8,
          warning_blink_rate: 12,
          critical_steering: 30,
          warning_steering: 15,
          speed_limit_buffer: 10,
        },
        description: 'Alert threshold settings',
      },
      {
        key: 'theme',
        value: { mode: 'dark' },
        description: 'UI theme preference',
      },
    ]);

    console.log('Initial data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

export async function updateDriverMetrics(driverId: string, vehicleId: string) {
  const { data: lastMetric } = await supabase
    .from('real_time_metrics')
    .select('*')
    .eq('driver_id', driverId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  const newMetrics = generateRealisticMetrics(lastMetric || undefined);

  const latitude = lastMetric
    ? lastMetric.latitude + (Math.random() - 0.5) * 0.001
    : indianCities[0].lat;
  const longitude = lastMetric
    ? lastMetric.longitude + (Math.random() - 0.5) * 0.001
    : indianCities[0].lng;

  const { data, error } = await supabase
    .from('real_time_metrics')
    .insert({
      driver_id: driverId,
      vehicle_id: vehicleId,
      latitude,
      longitude,
      ...newMetrics,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (newMetrics.alertness_score < 40 || newMetrics.steering_deviation > 20) {
    await supabase.from('alerts').insert({
      driver_id: driverId,
      severity: 'critical',
      type: newMetrics.alertness_score < 40 ? 'fatigue' : 'steering',
      message:
        newMetrics.alertness_score < 40
          ? 'Critical fatigue level detected'
          : 'Excessive steering deviation detected',
    });
  } else if (newMetrics.alertness_score < 60 || newMetrics.steering_deviation > 10) {
    await supabase.from('alerts').insert({
      driver_id: driverId,
      severity: 'warning',
      type: newMetrics.alertness_score < 60 ? 'fatigue' : 'steering',
      message:
        newMetrics.alertness_score < 60
          ? 'Alertness declining - consider break'
          : 'Steering deviation above normal',
    });
  }

  return data;
}
