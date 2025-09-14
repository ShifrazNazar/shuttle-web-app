// Shuttle fleet management types for the web application

export interface ShuttleFleet {
  id: string;
  licensePlate: string;
  capacity: number;
  driverId?: string; // Reference to users collection
  status: "active" | "inactive" | "maintenance";
  model?: string;
  year?: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShuttleFormData {
  licensePlate: string;
  capacity: number;
  model: string;
  year: number;
  color: string;
  status: "active" | "inactive" | "maintenance";
}

export interface ShuttleAssignment {
  shuttleId: string;
  driverId: string;
  assignedAt: Date;
  assignedBy: string; // Admin user ID
}

export interface ShuttleStats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  assigned: number;
  available: number;
}
