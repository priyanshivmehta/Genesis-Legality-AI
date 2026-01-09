import { DriverData, TrendDataPoint } from './mockData';

export function calculateAlertnessScore(
  blinkRate: number,
  steeringDeviation: number,
  speed: number
): number {
  const blinkScore = Math.min(100, (blinkRate / 18) * 40);
  const steeringScore = Math.max(0, 40 - steeringDeviation * 4);
  const speedScore = speed > 90 ? 10 : 20;

  return Math.round(blinkScore + steeringScore + speedScore);
}

export function getFatigueLevelColor(level: string): string {
  switch (level) {
    case 'Alert':
      return '#10b981';
    case 'Mild':
      return '#fbbf24';
    case 'Moderate':
      return '#f97316';
    case 'Critical':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export function getFatigueLevelIcon(level: string): string {
  switch (level) {
    case 'Alert':
      return '🟢';
    case 'Mild':
      return '🟡';
    case 'Moderate':
      return '🟠';
    case 'Critical':
      return '🔴';
    default:
      return '⚪';
  }
}

export function exportTripReport(
  driverData: DriverData,
  trendData: TrendDataPoint[],
  alerts: any[],
  tripDuration: number
) {
  const report = {
    trip_summary: {
      driver_id: driverData.driver_id,
      driver_name: driverData.driver_name,
      date: new Date().toLocaleDateString(),
      duration_minutes: tripDuration,
      start_location: driverData.location,
    },
    final_metrics: {
      alertness_score: driverData.alertness_score,
      fatigue_level: driverData.fatigue_level,
      average_speed: Math.round(
        trendData.reduce((sum, d) => sum + d.speed, 0) / trendData.length
      ),
      average_alertness: Math.round(
        trendData.reduce((sum, d) => sum + d.alertness, 0) / trendData.length
      ),
    },
    alerts_summary: {
      total_alerts: alerts.length,
      critical_alerts: alerts.filter((a) => a.severity === 'critical').length,
      warning_alerts: alerts.filter((a) => a.severity === 'warning').length,
      info_alerts: alerts.filter((a) => a.severity === 'info').length,
    },
    detailed_alerts: alerts,
    trend_data: trendData,
    generated_at: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `trip-report-${driverData.driver_id}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function speakAlert(message: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export function getAlertSeverity(
  alertness: number,
  blinkRate: number,
  steeringDeviation: number
): 'info' | 'warning' | 'critical' {
  if (alertness < 40 || blinkRate < 6 || steeringDeviation > 10) {
    return 'critical';
  }
  if (alertness < 60 || blinkRate < 10 || steeringDeviation > 7) {
    return 'warning';
  }
  return 'info';
}
