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
  boardingRecords: any[];
  digitalTravelCards: any[];
  locations: any[];
  dailyStats?: any[];
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
  locationUsage?: {
    location: string;
    pickups: number;
    dropoffs: number;
    popularity: number;
  }[];
}

// AI Analytics Types
export interface AIInsight {
  type: "success" | "warning" | "info" | "recommendation";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action?: string;
}

export interface AIPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
}

export interface AIRecommendation {
  category: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  timeline: string;
  steps: string[];
}

export interface DemandPrediction {
  routeId: string;
  routeName: string;
  predictedDemand: number;
  confidence: number;
  timeSlot: string;
  date: string;
  reasoning: string;
  recommendedAction: string;
}

export interface ScheduleOptimization {
  routeId: string;
  currentSchedule: string[];
  optimizedSchedule: string[];
  efficiencyGain: number;
  reasoning: string;
  implementationSteps: string[];
}
