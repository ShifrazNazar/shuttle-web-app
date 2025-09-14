export interface FirebaseDriverData {
  busId?: string;
  latitude: number;
  longitude: number;
  heading?: number;
  timestamp?: number;
  driverEmail?: string;
  isActive: boolean;
}

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
}
