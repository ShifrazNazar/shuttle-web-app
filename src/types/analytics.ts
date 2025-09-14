export interface AnalyticsData {
  totalRoutes: number;
  totalDrivers: number;
  totalStudents: number;
  activeShuttles: number;
  assignedShuttles: number;
  availableShuttles: number;
  activeDrivers: number;
  routes: any[];
  shuttles: any[];
  users: any[];
  routeAssignments: any[];
  // Legacy fields for backward compatibility
  totalDepartures?: number;
  averageWaitTime?: number;
  onTimePercentage?: number;
  peakHours?: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  routePerformance?: {
    routeId: string;
    routeName: string;
    usage: number;
    efficiency: number;
    delays: number;
  }[];
  dailyStats?: {
    date: string;
    passengers: number;
    departures: number;
    delays: number;
  }[];
  locationUsage?: {
    location: string;
    pickups: number;
    dropoffs: number;
    popularity: number;
  }[];
}
