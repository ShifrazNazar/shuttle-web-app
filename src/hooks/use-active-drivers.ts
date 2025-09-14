import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { rtdb } from "~/lib/firebaseClient";

interface ActiveDriver {
  driverId: string;
  busId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  driverEmail?: string;
  isActive: boolean;
}

export const useActiveDrivers = () => {
  const [activeDrivers, setActiveDrivers] = useState<ActiveDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activeDriversRef = ref(rtdb, "activeDrivers");

    const unsubscribe = onValue(
      activeDriversRef,
      (snapshot) => {
        try {
          setLoading(false);
          setError(null);

          if (snapshot.exists()) {
            const data = snapshot.val();
            const drivers: ActiveDriver[] = Object.entries(
              data as Record<string, ActiveDriver>,
            ).map(([driverId, driverData]) => ({
              driverId,
              ...(driverData as Omit<ActiveDriver, "driverId">),
            }));

            // Filter only active drivers
            const activeDrivers = drivers.filter((driver) => driver.isActive);
            setActiveDrivers(activeDrivers);
          } else {
            setActiveDrivers([]);
          }
        } catch (err) {
          console.error("Error processing active drivers data:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load active drivers",
          );
        }
      },
      (err) => {
        console.error("Error listening to active drivers:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return () => {
      off(activeDriversRef, "value", unsubscribe);
    };
  }, []);

  return {
    activeDrivers,
    loading,
    error,
  };
};
