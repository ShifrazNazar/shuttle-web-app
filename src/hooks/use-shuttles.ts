import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import type { ShuttleFleet, ShuttleStats } from "~/types";

export const useShuttles = () => {
  const [shuttles, setShuttles] = useState<ShuttleFleet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShuttles = async () => {
    try {
      setLoading(true);
      setError(null);

      const shuttlesRef = collection(db, "shuttles");
      const shuttlesQuery = query(shuttlesRef, orderBy("licensePlate", "asc"));
      const snapshot = await getDocs(shuttlesQuery);

      const shuttlesData: ShuttleFleet[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          licensePlate: data.licensePlate as string,
          capacity: data.capacity as number,
          driverId: data.driverId as string | undefined,
          status: data.status as "active" | "inactive" | "maintenance",
          model: data.model as string | undefined,
          year: data.year as number | undefined,
          color: data.color as string | undefined,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
        };
      });

      setShuttles(shuttlesData);
    } catch (err) {
      console.error("Error fetching shuttles:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch shuttles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShuttles();
  }, []);

  return {
    shuttles,
    loading,
    error,
    refetch: fetchShuttles,
  };
};

export const useAvailableShuttles = () => {
  const { shuttles, loading, error } = useShuttles();

  const availableShuttles = shuttles.filter(
    (shuttle) => shuttle.status === "active" && !shuttle.driverId,
  );

  return {
    availableShuttles,
    loading,
    error,
  };
};

export const useShuttleStats = () => {
  const { shuttles, loading, error } = useShuttles();

  const stats: ShuttleStats = {
    total: shuttles.length,
    active: shuttles.filter((s) => s.status === "active").length,
    inactive: shuttles.filter((s) => s.status === "inactive").length,
    maintenance: shuttles.filter((s) => s.status === "maintenance").length,
    assigned: shuttles.filter((s) => s.driverId).length,
    available: shuttles.filter((s) => s.status === "active" && !s.driverId)
      .length,
  };

  return {
    stats,
    loading,
    error,
  };
};

export const useShuttleActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShuttle = async (
    shuttleData: Omit<ShuttleFleet, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const shuttlesRef = collection(db, "shuttles");
      const now = new Date();

      const newShuttle = {
        ...shuttleData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(shuttlesRef, newShuttle);
      return docRef.id;
    } catch (err) {
      console.error("Error creating shuttle:", err);
      setError(err instanceof Error ? err.message : "Failed to create shuttle");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateShuttle = async (
    shuttleId: string,
    updates: Partial<ShuttleFleet>,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const shuttleRef = doc(db, "shuttles", shuttleId);
      await updateDoc(shuttleRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error updating shuttle:", err);
      setError(err instanceof Error ? err.message : "Failed to update shuttle");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteShuttle = async (shuttleId: string) => {
    try {
      setLoading(true);
      setError(null);

      const shuttleRef = doc(db, "shuttles", shuttleId);
      await deleteDoc(shuttleRef);
    } catch (err) {
      console.error("Error deleting shuttle:", err);
      setError(err instanceof Error ? err.message : "Failed to delete shuttle");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignShuttleToDriver = async (shuttleId: string, driverId: string) => {
    try {
      setLoading(true);
      setError(null);

      const shuttleRef = doc(db, "shuttles", shuttleId);
      await updateDoc(shuttleRef, {
        driverId,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error assigning shuttle:", err);
      setError(err instanceof Error ? err.message : "Failed to assign shuttle");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unassignShuttle = async (shuttleId: string) => {
    try {
      setLoading(true);
      setError(null);

      const shuttleRef = doc(db, "shuttles", shuttleId);
      await updateDoc(shuttleRef, {
        driverId: null,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error unassigning shuttle:", err);
      setError(
        err instanceof Error ? err.message : "Failed to unassign shuttle",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createShuttle,
    updateShuttle,
    deleteShuttle,
    assignShuttleToDriver,
    unassignShuttle,
    loading,
    error,
  };
};
