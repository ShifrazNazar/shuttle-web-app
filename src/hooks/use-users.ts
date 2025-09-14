import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import type { Driver, Student } from "~/types";

// Types for API responses
interface CreateUserResponse {
  success: boolean;
  message: string;
  user: {
    uid: string;
    email: string;
    username: string;
    temporaryPassword: string;
  };
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
}

// Query keys
export const userKeys = {
  all: ["users"] as const,
  drivers: () => [...userKeys.all, "drivers"] as const,
  students: () => [...userKeys.all, "students"] as const,
  driver: (id: string) => [...userKeys.drivers(), id] as const,
  student: (id: string) => [...userKeys.students(), id] as const,
};

// Fetch users from Firestore
async function fetchUsers() {
  const usersRef = collection(db, "users");

  // Fetch drivers
  const driversQuery = query(usersRef, where("role", "==", "driver"));
  const driversSnapshot = await getDocs(driversQuery);
  const driversData = driversSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt:
      (doc.data().createdAt as FirebaseFirestore.Timestamp)?.toDate() ??
      new Date(),
    updatedAt:
      (doc.data().updatedAt as FirebaseFirestore.Timestamp)?.toDate() ??
      new Date(),
  })) as Driver[];

  // Fetch students
  const studentsQuery = query(usersRef, where("role", "==", "student"));
  const studentsSnapshot = await getDocs(studentsQuery);
  const studentsData = studentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt:
      (doc.data().createdAt as FirebaseFirestore.Timestamp)?.toDate() ??
      new Date(),
    updatedAt:
      (doc.data().updatedAt as FirebaseFirestore.Timestamp)?.toDate() ??
      new Date(),
  })) as Student[];

  return { drivers: driversData, students: studentsData };
}

// API call functions
async function callAdminAPI(
  endpoint: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch(`/api/admin/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };
    throw new Error(errorData.message ?? "Admin operation failed");
  }

  return (await response.json()) as Record<string, unknown>;
}

// Custom hooks
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      username: string;
      role: "driver" | "student";
      assignedShuttleId?: string;
    }) => {
      return callAdminAPI(
        "create-user",
        data,
      ) as unknown as Promise<CreateUserResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      uid: string;
      email: string;
      displayName: string;
    }) => {
      return callAdminAPI(
        "update-user",
        data,
      ) as unknown as Promise<UpdateUserResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uid: string) => {
      // Call the API to delete from both Auth and Firestore
      const result = (await callAdminAPI("delete-user", {
        uid,
      })) as unknown as Promise<DeleteUserResponse>;

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { uid: string; newPassword: string }) => {
      return callAdminAPI(
        "reset-user",
        data,
      ) as unknown as Promise<UpdateUserResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useAssignBus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      driverId: string;
      assignedShuttleId: string;
    }) => {
      const driverRef = doc(db, "users", data.driverId);
      await updateDoc(driverRef, {
        assignedShuttleId: data.assignedShuttleId,
        updatedAt: new Date(),
      });

      // Update route assignments
      await updateRouteAssignmentsForDriver(
        data.driverId,
        data.assignedShuttleId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// Helper function to update route assignments
async function updateRouteAssignmentsForDriver(
  driverId: string,
  newBusId?: string,
) {
  try {
    const routeAssignmentsRef = collection(db, "routeAssignments");
    const routeAssignmentsQuery = query(
      routeAssignmentsRef,
      where("driverId", "==", driverId),
      where("status", "==", "active"),
    );
    const routeAssignmentsSnapshot = await getDocs(routeAssignmentsQuery);

    if (routeAssignmentsSnapshot.empty) {
      return;
    }

    const driverRef = doc(db, "users", driverId);
    const driverDoc = await getDoc(driverRef);
    const driverData = driverDoc.exists() ? driverDoc.data() : null;

    if (!driverData) {
      console.error("Driver data not found for route assignment update");
      return;
    }

    const batch = writeBatch(db);
    routeAssignmentsSnapshot.docs.forEach((assignmentDoc) => {
      const assignmentRef = doc(db, "routeAssignments", assignmentDoc.id);
      batch.update(assignmentRef, {
        driverEmail: driverData.email,
        driverUsername: driverData.username,
        busId: newBusId || driverData.assignedShuttleId,
        updatedAt: new Date(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error updating route assignments:", error);
  }
}
