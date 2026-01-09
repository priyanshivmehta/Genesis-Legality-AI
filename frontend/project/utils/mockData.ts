export interface DriverData {
  driver_id: string;
  driver_name: string;
  location: string;
  alertness_score: number;
  blink_rate: number;
  steering_deviation: number;
  speed: number;
  fatigue_level: 'Alert' | 'Mild' | 'Moderate' | 'Critical';
  predicted_fatigue_in: string;
  last_event: string;
  timestamp: string;
  gps: { lat: number; lng: number };
}

export interface AlertEntry {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action: string;
}

export interface TrendDataPoint {
  timestamp: string;
  alertness: number;
  speed: number;
  blinkRate: number;
}

const cities = [
  { name: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 },
  { name: 'Mumbai, Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
];

const driverNames = [
  'Rahul Sharma',
  'Priya Patel',
  'Amit Kumar',
  'Sneha Reddy',
  'Vikram Singh',
];

export function generateRandomDriver(index: number): DriverData {
  const city = cities[index % cities.length];
  const alertness = Math.floor(Math.random() * 40) + 60;
  const blinkRate = Math.floor(Math.random() * 10) + 12;
  const steeringDeviation = Math.random() * 8 + 1;
  const speed = Math.floor(Math.random() * 60) + 40;

  return {
    driver_id: `DRV${String(index + 1).padStart(3, '0')}`,
    driver_name: driverNames[index % driverNames.length],
    location: city.name,
    alertness_score: alertness,
    blink_rate: blinkRate,
    steering_deviation: Number(steeringDeviation.toFixed(1)),
    speed,
    fatigue_level: calculateFatigueLevel(alertness),
    predicted_fatigue_in: predictFatigue(alertness, blinkRate, steeringDeviation),
    last_event: generateLastEvent(alertness, blinkRate, steeringDeviation),
    timestamp: new Date().toISOString(),
    gps: {
      lat: city.lat + (Math.random() - 0.5) * 0.1,
      lng: city.lng + (Math.random() - 0.5) * 0.1,
    },
  };
}

export function calculateFatigueLevel(alertness: number): 'Alert' | 'Mild' | 'Moderate' | 'Critical' {
  if (alertness >= 80) return 'Alert';
  if (alertness >= 60) return 'Mild';
  if (alertness >= 40) return 'Moderate';
  return 'Critical';
}

export function predictFatigue(alertness: number, blinkRate: number, steeringDeviation: number): string {
  const fatigueScore = (100 - alertness) + (20 - blinkRate) * 2 + steeringDeviation * 3;

  if (fatigueScore < 20) return '> 30 min';
  if (fatigueScore < 40) return '15-30 min';
  if (fatigueScore < 60) return '5-15 min';
  return '< 5 min';
}

export function generateLastEvent(alertness: number, blinkRate: number, steeringDeviation: number): string {
  const events = [];

  if (blinkRate < 10) {
    events.push('Blink rate dropped below threshold');
  }
  if (steeringDeviation > 7) {
    events.push('Steering deviation exceeded safe margin');
  }
  if (alertness < 60) {
    events.push('Low alertness detected');
  }

  return events.length > 0 ? events[0] : 'Normal driving pattern';
}

export function generateTrendData(length: number = 20): TrendDataPoint[] {
  const now = Date.now();
  const data: TrendDataPoint[] = [];

  for (let i = length - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * 10000).toLocaleTimeString();
    data.push({
      timestamp,
      alertness: Math.floor(Math.random() * 30) + 60,
      speed: Math.floor(Math.random() * 40) + 50,
      blinkRate: Math.floor(Math.random() * 8) + 10,
    });
  }

  return data;
}

export function generateAlert(severity: 'info' | 'warning' | 'critical', message: string, action: string): AlertEntry {
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleTimeString(),
    severity,
    message,
    action,
  };
}

export function getRecommendedAction(fatigueLevel: string, predictedFatigue: string): string {
  if (fatigueLevel === 'Critical') {
    return 'IMMEDIATE REST REQUIRED - Pull over safely';
  }
  if (fatigueLevel === 'Moderate' || predictedFatigue.includes('< 5')) {
    return 'Take a 15-minute break in the next 2 km';
  }
  if (fatigueLevel === 'Mild' || predictedFatigue.includes('5-15')) {
    return 'Plan a rest stop within 5 km - Hydrate';
  }
  return 'Continue monitoring - Stay hydrated';
}
