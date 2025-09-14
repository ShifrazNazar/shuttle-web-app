export interface Driver {
  id: string;
  uid?: string; // Firebase Auth UID
  email: string;
  username: string;
  role: "driver";
  assignedShuttleId: string;
  assignedRouteId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Student {
  id: string;
  uid?: string; // Firebase Auth UID
  email: string;
  username: string;
  role: "student";
  assignedShuttleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Shuttle {
  id: string;
  lat: number;
  lng: number;
  heading?: number;
  updatedAt?: number;
  driverId: string;
  driverEmail?: string;
  isActive: boolean;
}
