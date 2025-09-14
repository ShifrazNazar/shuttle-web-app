import type { Timestamp } from "firebase/firestore";
import type { Driver } from "./drivers";

export interface RouteData {
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  operatingDays: string[];
  schedule: string[];
  specialNotes?: string;
}

export interface RouteAssignment {
  id: string;
  routeId: string;
  routeName: string;
  driverId: string;
  driverEmail: string;
  driverUsername: string;
  busId: string;
  assignedAt: Timestamp;
  status: "active" | "inactive" | "temporary";
  assignedBy: string;
  priority?: number; // For multiple drivers on same route
}

export interface ScheduleTime {
  time: string;
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  assignedDriver?: Driver;
  status: "upcoming" | "active" | "completed" | "delayed";
}
