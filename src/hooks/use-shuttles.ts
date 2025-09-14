import { useQuery } from "@tanstack/react-query";
import { onValue, ref } from "firebase/database";
import { rtdb } from "~/lib/firebaseClient";
import type { Shuttle, FirebaseDriverData } from "~/types";

// Query keys
export const shuttleKeys = {
  all: ["shuttles"] as const,
  active: () => [...shuttleKeys.all, "active"] as const,
};

// Fetch active shuttles from Realtime Database
async function fetchActiveShuttles(): Promise<Shuttle[]> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onValue(
      ref(rtdb, "/activeDrivers"),
      (snap) => {
        const val = snap.val() as Record<string, FirebaseDriverData> | null;
        const shuttles: Shuttle[] = val
          ? Object.entries(val).map(([driverId, v]) => ({
              id: v.busId ?? driverId,
              lat: v.latitude,
              lng: v.longitude,
              heading: v.heading,
              updatedAt: v.timestamp,
              driverId: driverId,
              driverEmail: v.driverEmail,
              isActive: v.isActive,
            }))
          : [];
        unsubscribe();
        resolve(shuttles);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

// Custom hook
export function useActiveShuttles() {
  return useQuery({
    queryKey: shuttleKeys.active(),
    queryFn: fetchActiveShuttles,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 1000, // Consider data stale after 1 second
  });
}
