# Fleet Management Dashboard - Setup Instructions

## Overview
A comprehensive, production-ready fleet management system with real-time driver monitoring, vehicle tracking, route management, and intelligent alerting capabilities.

## Features

### Core Capabilities
- **Interactive Fleet Map**: Real-time visualization of all drivers with color-coded alertness markers
- **Driver Monitoring**: Comprehensive individual driver dashboards with live metrics
- **Vehicle Management**: Complete CRUD operations for fleet vehicles
- **Route Planning**: Create and manage delivery routes
- **Alert System**: Real-time critical alerts with audio notifications
- **Report Generation**: Comprehensive fleet and driver performance reports
- **Settings Management**: Configurable alert thresholds and system preferences

### Real-Time Metrics Tracked
- Alertness Score (0-100 scale)
- Blink Rate (blinks per minute, normal: 15-20)
- Steering Deviation (degrees, safe range: ±5°)
- Speed Monitoring (with configurable limits)
- GPS Location tracking
- Fatigue Prediction algorithms

## Setup Instructions

### 1. Configure Supabase

You'll need to set up a Supabase project:

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once created, get your project URL and anon key from the project settings
3. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

The database schema is automatically created when you first load the application. The migration includes:

- **Drivers Table**: Store driver information and status
- **Vehicles Table**: Manage fleet vehicles with maintenance tracking
- **Routes Table**: Define delivery and transport routes
- **Driver Assignments**: Link drivers to vehicles and routes
- **Real-Time Metrics**: Store live monitoring data
- **Alerts Table**: Track all system alerts and incidents
- **Reports Table**: Historical performance data
- **System Settings**: Configurable thresholds and preferences

### 3. Run the Application

```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000` - you'll automatically be redirected to the dashboard.

### 4. Initial Data

The application will automatically seed initial mock data when first loaded:
- 10 drivers with realistic profiles
- 10 vehicles with various makes and models
- 5 pre-configured routes
- 6 active driver assignments
- Real-time metrics for active drivers

## Application Structure

### Main Dashboard (`/dashboard`)
- Fleet overview with statistics
- Interactive map showing active drivers
- Live driver status cards
- Quick access to critical alerts

### Driver Management (`/dashboard/drivers`)
- List all drivers with search and filtering
- Add, edit, and delete drivers
- View individual driver details with:
  - Real-time alertness monitoring
  - Performance trend charts
  - Alert history
  - Trip analytics

### Vehicle Management (`/dashboard/vehicles`)
- Complete vehicle fleet overview
- Track fuel levels and mileage
- Maintenance scheduling
- Vehicle status management

### Route Management (`/dashboard/routes`)
- Create and edit routes
- View route details (distance, duration)
- Archive unused routes

### Alert Management (`/dashboard/alerts`)
- Real-time alert feed
- Filter by severity (critical, warning, info)
- Acknowledge alerts
- View alert statistics

### Reports (`/dashboard/reports`)
- Generate fleet-wide performance reports
- Individual driver performance analysis
- Safety and incident reports
- Route efficiency analytics
- Export reports as JSON

### Settings (`/dashboard/settings`)
- Configure alert thresholds:
  - Alertness levels (critical/warning)
  - Blink rate limits
  - Steering deviation limits
  - Speed buffers
- Notification preferences
- System information

## Simulation Features

Each driver detail page includes simulation controls:
- **Simulate Fatigue**: Trigger a fatigue event
- **Increase Speed**: Test speed monitoring
- **Simulate Drift**: Generate steering deviation alert
- **Change Route**: Update driver location
- **Reset Metrics**: Return to baseline values

## Technical Details

### Technology Stack
- **Frontend**: Next.js 13+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **UI Components**: Radix UI, shadcn/ui

### Real-Time Updates
- Data automatically refreshes every 5 seconds
- Live metrics simulation for active drivers
- Real-time alert notifications
- WebSocket-ready architecture

### Security
- Row Level Security (RLS) enabled on all tables
- Public access policies for demonstration (configure for production)
- Prepared for role-based access control

## Production Deployment

Before deploying to production:

1. Update RLS policies to restrict access based on user roles
2. Configure proper authentication
3. Set up email notifications for alerts
4. Configure backup and monitoring
5. Review and adjust alert thresholds
6. Set up proper logging and error tracking

## Database Migrations

All migrations are in the Supabase dashboard. The initial migration:
- Creates all required tables
- Sets up indexes for performance
- Configures RLS policies
- Seeds default settings

## Support & Documentation

- Driver alertness scoring uses combination of blink rate, steering deviation, and speed
- Fatigue levels: Alert (80-100), Mild (60-79), Moderate (40-59), Critical (<40)
- Safe steering range: ±5 degrees
- Normal blink rate: 15-20 per minute
- Fatigue prediction uses weighted algorithm considering all metrics

## Customization

The system is designed to be easily customizable:
- Adjust alert thresholds in Settings
- Modify color schemes in Tailwind config
- Add new metrics to the monitoring system
- Extend reporting capabilities
- Integrate with external APIs

## Notes

- This is a demonstration system with mock data generation
- In production, integrate with actual vehicle sensors and GPS devices
- Audio alerts use browser speech synthesis API
- Reports are currently exported as JSON (PDF export can be added)
- Map visualization is simplified (integrate with Google Maps/Mapbox for production)
