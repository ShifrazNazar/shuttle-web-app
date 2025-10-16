"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { showToast } from "~/lib/toast";
import {
  useAvailableShuttles,
  useShuttles,
  useShuttleActions,
} from "~/hooks/use-shuttles";

import { db } from "~/lib/firebaseClient";
import { Button } from "~/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  Car,
  Search,
  Mail,
  GraduationCap,
  Bus,
  Shield,
  Key,
  Loader2,
} from "lucide-react";
import type { Driver, Student } from "~/types";

export default function UsersPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Get available shuttles from Firestore
  const { availableShuttles, loading: shuttlesLoading } =
    useAvailableShuttles();

  // Get all shuttles for display details
  const { shuttles } = useShuttles();
  const { assignShuttleToDriver, unassignShuttle } = useShuttleActions();
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAssignBusModal, setShowAssignBusModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [assigningDriver, setAssigningDriver] = useState<Driver | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<
    Driver | Student | null
  >(null);
  const [driverFormData, setDriverFormData] = useState({
    email: "",
    username: "",
  });
  const [studentFormData, setStudentFormData] = useState({
    email: "",
    username: "",
  });
  const [assignBusFormData, setAssignBusFormData] = useState({
    assignedShuttleId: "",
  });

  // Available shuttles are now fetched from Firestore
  const [passwordResetData, setPasswordResetData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [newUserInfo, setNewUserInfo] = useState({
    email: "",
    username: "",
    role: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: "driver" | "student";
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch drivers
      const driversRef = collection(db, "users");
      const driversQuery = query(driversRef, where("role", "==", "driver"));
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
      const studentsQuery = query(driversRef, where("role", "==", "student"));
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

      setDrivers(driversData);
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update route assignments when driver info changes
  const updateRouteAssignmentsForDriver = async (
    driverId: string,
    newBusId?: string,
  ) => {
    try {
      // Get all route assignments for this driver
      const routeAssignmentsRef = collection(db, "routeAssignments");
      const routeAssignmentsQuery = query(
        routeAssignmentsRef,
        where("driverId", "==", driverId),
        where("status", "==", "active"),
      );
      const routeAssignmentsSnapshot = await getDocs(routeAssignmentsQuery);

      if (routeAssignmentsSnapshot.empty) {
        return; // No route assignments to update
      }

      // Get updated driver info
      const driverRef = doc(db, "users", driverId);
      const driverDoc = await getDoc(driverRef);
      const driverData = driverDoc.exists() ? driverDoc.data() : null;

      if (!driverData) {
        console.error("Driver data not found for route assignment update");
        return;
      }

      // Update all route assignments for this driver
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
      console.log(
        `Updated ${routeAssignmentsSnapshot.docs.length} route assignments for driver ${driverId}`,
      );
    } catch (error) {
      console.error("Error updating route assignments:", error);
      // Don't throw error here as it's not critical for the main operation
    }
  };

  // Admin function to call backend API for user management
  const callAdminAPI = async (
    endpoint: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> => {
    try {
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
    } catch (error) {
      console.error(`Admin API error (${endpoint}):`, error);
      throw error;
    }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState("driverSubmit", true);
    try {
      if (editingDriver) {
        // Update existing driver using UID as document ID
        const driverRef = doc(
          db,
          "users",
          editingDriver.uid || editingDriver.id,
        );
        await updateDoc(driverRef, {
          email: driverFormData.email,
          username: driverFormData.username,
          updatedAt: new Date(),
        });

        // Update route assignments with new driver info
        await updateRouteAssignmentsForDriver(
          editingDriver.uid || editingDriver.id,
          editingDriver.assignedShuttleId,
        );

        // Update Firebase Auth profile using admin API
        if (editingDriver.uid) {
          try {
            await callAdminAPI("update-user", {
              uid: editingDriver.uid,
              email: driverFormData.email,
              displayName: driverFormData.username,
            });

            showToast.userUpdated("Driver");
          } catch (adminError) {
            console.error("Admin API error:", adminError);
            showToast.error("Update partially failed");
          }
        } else {
          showToast.error("Update failed - no Auth UID");
        }
      } else {
        // Create new driver using backend API
        try {
          const apiResult = await callAdminAPI("create-user", {
            email: driverFormData.email,
            username: driverFormData.username,
            role: "driver",
            assignedShuttleId: "", // Will be assigned separately
          });

          console.log("API Result:", apiResult); // Debug log

          // Show password in modal for easy copying
          const tempPassword =
            (apiResult as { user?: { temporaryPassword?: string } }).user
              ?.temporaryPassword || "Not available";
          setGeneratedPassword(tempPassword);
          setNewUserInfo({
            email: driverFormData.email,
            username: driverFormData.username,
            role: "Driver",
          });
          setShowPasswordModal(true);

          showToast.userCreated("Driver");
        } catch (apiError: unknown) {
          console.error("Admin API error:", apiError);
          let errorMessage = "Failed to create driver account.";

          if (
            apiError instanceof Error &&
            apiError.message?.includes("already exists")
          ) {
            errorMessage = "A user with this email already exists.";
          } else if (
            apiError instanceof Error &&
            apiError.message?.includes("Invalid email")
          ) {
            errorMessage = "Invalid email address format.";
          } else if (
            apiError instanceof Error &&
            apiError.message?.includes("weak-password")
          ) {
            errorMessage = "Password is too weak (minimum 6 characters).";
          }

          showToast.createUserError(errorMessage);
          return;
        }
      }

      setShowAddDriverModal(false);
      setEditingDriver(null);
      resetDriverForm();
      await fetchUsers();
    } catch (error: unknown) {
      console.error("Error saving driver:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      showToast.error(errorMessage);
    } finally {
      setLoadingState("driverSubmit", false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingState("studentSubmit", true);
    try {
      if (editingStudent) {
        // Update existing student using UID as document ID
        const studentRef = doc(
          db,
          "users",
          editingStudent.uid || editingStudent.id,
        );
        await updateDoc(studentRef, {
          email: studentFormData.email,
          username: studentFormData.username,
          updatedAt: new Date(),
        });

        // Update Firebase Auth profile using admin API
        if (editingStudent.uid) {
          try {
            await callAdminAPI("update-user", {
              uid: editingStudent.uid,
              email: studentFormData.email,
              displayName: studentFormData.username,
            });

            showToast.userUpdated("Student");
          } catch (adminError) {
            console.error("Admin API error:", adminError);
            showToast.error("Update partially failed");
          }
        }
      } else {
        // Create new student using backend API
        try {
          const apiResult = await callAdminAPI("create-user", {
            email: studentFormData.email,
            username: studentFormData.username,
            role: "student",
          });

          console.log("API Result:", apiResult); // Debug log

          // Show password in modal for easy copying
          const tempPassword =
            (apiResult as { user?: { temporaryPassword?: string } }).user
              ?.temporaryPassword || "Not available";
          setGeneratedPassword(tempPassword);
          setNewUserInfo({
            email: studentFormData.email,
            username: studentFormData.username,
            role: "Student",
          });
          setShowPasswordModal(true);

          showToast.userCreated("Student");
        } catch (apiError: unknown) {
          console.error("Admin API error:", apiError);
          let errorMessage = "Failed to create student account.";

          if (
            apiError instanceof Error &&
            apiError.message?.includes("already exists")
          ) {
            errorMessage = "A user with this email already exists.";
          } else if (
            apiError instanceof Error &&
            apiError.message?.includes("Invalid email")
          ) {
            errorMessage = "Invalid email address format.";
          } else if (
            apiError instanceof Error &&
            apiError.message?.includes("weak-password")
          ) {
            errorMessage = "Password is too weak (minimum 6 characters).";
          }

          showToast.createUserError(errorMessage);
          return;
        }
      }

      setShowAddStudentModal(false);
      setEditingStudent(null);
      resetStudentForm();
      await fetchUsers();
    } catch (error: unknown) {
      console.error("Error saving student:", error);
      showToast.error(
        error instanceof Error ? error.message : "Unexpected error",
      );
    } finally {
      setLoadingState("studentSubmit", false);
    }
  };

  const handleAssignBus = async () => {
    if (!assigningDriver) return;

    setLoadingState("assignBus", true);
    try {
      const driverRef = doc(
        db,
        "users",
        assigningDriver.uid || assigningDriver.id,
      );

      const newAssignment = assignBusFormData.assignedShuttleId;
      const oldAssignment = assigningDriver.assignedShuttleId;

      // Update driver's assignedShuttleId
      await updateDoc(driverRef, {
        assignedShuttleId: newAssignment,
        updatedAt: new Date(),
      });

      // Update shuttle assignments
      if (oldAssignment) {
        // Unassign old shuttle
        await unassignShuttle(oldAssignment);
      }

      if (newAssignment) {
        // Assign new shuttle
        await assignShuttleToDriver(
          newAssignment,
          assigningDriver.uid || assigningDriver.id,
        );
      }

      // Update route assignments with new bus ID
      await updateRouteAssignmentsForDriver(
        assigningDriver.uid || assigningDriver.id,
        newAssignment,
      );

      setShowAssignBusModal(false);
      setAssigningDriver(null);
      setAssignBusFormData({ assignedShuttleId: "" });
      await fetchUsers();

      if (newAssignment) {
        showToast.busAssigned();
      } else {
        showToast.success("Bus assignment cleared");
      }
    } catch (error) {
      console.error("Error assigning bus:", error);
      showToast.assignBusError("Failed to assign bus");
    } finally {
      setLoadingState("assignBus", false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingPasswordUser) return;

    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      showToast.error("Passwords don't match");
      return;
    }

    if (passwordResetData.newPassword.length < 6) {
      showToast.error("Password too short");
      return;
    }

    setLoadingState("resetPassword", true);
    try {
      if (resettingPasswordUser.uid) {
        await callAdminAPI("reset-user", {
          uid: resettingPasswordUser.uid,
          newPassword: passwordResetData.newPassword,
        });

        showToast.passwordReset();
      } else {
        showToast.error("Reset not available - no Auth UID");
      }

      setShowResetPasswordModal(false);
      setResettingPasswordUser(null);
      setPasswordResetData({ newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      console.error("Error resetting password:", error);
      showToast.passwordResetError(
        error instanceof Error ? error.message : "Reset failed",
      );
    } finally {
      setLoadingState("resetPassword", false);
    }
  };

  const handleDeleteDriver = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    setShowDeleteConfirm({
      type: "driver",
      id: driverId,
      name: driver.username,
      email: driver.email,
    });
  };

  const confirmDeleteDriver = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== "driver") return;

    setLoadingState("deleteDriver", true);
    try {
      const driver = drivers.find((d) => d.id === showDeleteConfirm.id);
      if (!driver) return;

      // Delete Firebase Auth account first (if exists)
      if (driver.uid) {
        try {
          await callAdminAPI("delete-user", { uid: driver.uid });
        } catch (authError) {
          console.warn("Could not delete Firebase Auth account:", authError);
          // Continue with Firestore deletion even if Auth deletion fails
        }
      }

      // Delete from Firestore using the UID as document ID
      await deleteDoc(doc(db, "users", driver.uid || showDeleteConfirm.id));

      await fetchUsers();
      showToast.userDeleted("Driver");
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting driver:", error);
      showToast.deleteUserError("Delete failed");
    } finally {
      setLoadingState("deleteDriver", false);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setShowDeleteConfirm({
      type: "student",
      id: studentId,
      name: student.username,
      email: student.email,
    });
  };

  const confirmDeleteStudent = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.type !== "student") return;

    setLoadingState("deleteStudent", true);
    try {
      const student = students.find((s) => s.id === showDeleteConfirm.id);
      if (!student) return;

      // Delete Firebase Auth account first (if exists)
      if (student.uid) {
        try {
          await callAdminAPI("delete-user", { uid: student.uid });
        } catch (authError) {
          console.warn("Could not delete Firebase Auth account:", authError);
          // Continue with Firestore deletion even if Auth deletion fails
        }
      }

      // Delete from Firestore using the UID as document ID
      await deleteDoc(doc(db, "users", student.uid || showDeleteConfirm.id));

      await fetchUsers();
      showToast.userDeleted("Student");
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast.deleteUserError("Delete failed");
    } finally {
      setLoadingState("deleteStudent", false);
    }
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setDriverFormData({
      email: driver.email,
      username: driver.username,
    });
    setShowAddDriverModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentFormData({
      email: student.email,
      username: student.username,
    });
    setShowAddStudentModal(true);
  };

  const handleAssignBusToDriver = (driver: Driver) => {
    setAssigningDriver(driver);
    setAssignBusFormData({
      assignedShuttleId: driver.assignedShuttleId || "",
    });
    setShowAssignBusModal(true);
  };

  const handleResetPassword = (user: Driver | Student) => {
    setResettingPasswordUser(user);
    setPasswordResetData({ newPassword: "", confirmPassword: "" });
    setShowResetPasswordModal(true);
  };

  const resetDriverForm = () => {
    setDriverFormData({
      email: "",
      username: "",
    });
  };

  const resetStudentForm = () => {
    setStudentFormData({
      email: "",
      username: "",
    });
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.username?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
      driver.email?.toLowerCase().includes(driverSearchTerm.toLowerCase()) ||
      driver.assignedShuttleId
        ?.toLowerCase()
        .includes(driverSearchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.username
        ?.toLowerCase()
        .includes(studentSearchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(studentSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Helper function to get shuttle details
  const getShuttleDetails = (shuttleId: string) => {
    const shuttle =
      availableShuttles.find((s) => s.id === shuttleId) ||
      shuttles.find((s) => s.id === shuttleId);
    if (!shuttle) return `Bus ${shuttleId}`;
    return `${shuttle.licensePlate} - ${shuttle.model} (${shuttle.year})`;
  };

  // Helper function to manage loading states
  const setLoadingState = (key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Shield className="h-6 w-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Secure backend API user management with Firebase Admin SDK. Create
            accounts, assign buses, reset passwords, and manage user profiles
            with full admin privileges and server-side security.
          </p>
          <div className="mt-2 flex gap-4 text-xs">
            <span className="text-muted-foreground">
              🚌 Total Fleet:{" "}
              {availableShuttles.length +
                drivers.filter((d) => d.assignedShuttleId).length}{" "}
              buses
            </span>
            <span className="text-green-600">
              Available: {availableShuttles.length} buses
            </span>
            <span className="text-red-600">
              Assigned:{" "}
              {drivers.filter((driver) => driver.assignedShuttleId).length}{" "}
              buses
            </span>
            {shuttlesLoading && (
              <span className="text-blue-600">⏳ Loading shuttles...</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDriverModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
          <Button onClick={() => setShowAddStudentModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Drivers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Car className="h-5 w-5 text-green-600" />
            Drivers ({filteredDrivers.length})
          </h2>
        </div>

        {/* Driver Search */}
        <div className="relative max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={driverSearchTerm}
            onChange={(e) => setDriverSearchTerm(e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border py-2 pr-3 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Drivers Table */}
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Driver
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Bus Assignment
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-muted/50 border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <Car className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{driver.username}</div>
                          <div className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {driver.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {driver.assignedShuttleId ? (
                        <div className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          {getShuttleDetails(driver.assignedShuttleId)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {driver.assignedShuttleId ? (
                        <div className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                          Active
                        </div>
                      ) : (
                        <div className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                          Pending Assignment
                        </div>
                      )}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {driver.createdAt?.toLocaleDateString() ?? "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDriver(driver)}
                          title="Edit driver details"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignBusToDriver(driver)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Assign bus"
                        >
                          <Bus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(driver)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Reset password"
                          disabled={!driver.uid}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDriver(driver.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete driver"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredDrivers.length === 0 && (
            <div className="text-muted-foreground py-12 text-center">
              <Car className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No drivers found</p>
              <p className="mt-1 text-xs">
                Add your first driver to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Students Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Students ({filteredStudents.length})
          </h2>
        </div>

        {/* Student Search */}
        <div className="relative max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students..."
            value={studentSearchTerm}
            onChange={(e) => setStudentSearchTerm(e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border py-3 pr-3 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Students Table */}
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/50 border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{student.username}</div>
                          <div className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                          {student.uid && (
                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                              <Shield className="h-3 w-3" />
                              Auth: ✓
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {student.createdAt?.toLocaleDateString() ?? "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStudent(student)}
                          title="Edit student details"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetPassword(student)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Reset password"
                          disabled={!student.uid}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-muted-foreground py-12 text-center">
              <GraduationCap className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No students found</p>
              <p className="mt-1 text-xs">
                Add your first student to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {editingDriver ? "Edit Driver" : "Add New Driver"}
            </h2>

            {editingDriver && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Editing Mode:</strong>
                  <br />• Firestore and Firebase Auth will both be updated
                  <br />• Email and username changes sync across both systems
                  <br />• Admin API ensures complete profile synchronization
                  <br />• User can continue using existing login credentials
                </p>
              </div>
            )}

            {!editingDriver && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">
                  <strong>Creating New Driver:</strong>
                  <br />• Backend API creates Firebase Auth account securely
                  <br />• Firestore profile automatically linked to Auth account
                  <br />• Bus assignment is done separately after creation
                  <br />• Secure random password generated automatically
                  <br />• Driver must change password on first login
                  <br />• All operations handled server-side for security
                </p>
              </div>
            )}

            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={driverFormData.username}
                  onChange={(e) =>
                    setDriverFormData({
                      ...driverFormData,
                      username: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Driver's full name"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  This will be displayed in Firebase Auth as the display name
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={driverFormData.email}
                  onChange={(e) =>
                    setDriverFormData({
                      ...driverFormData,
                      email: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="driver@example.com"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Used for Firebase Auth login
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loadingStates.driverSubmit}
                >
                  {loadingStates.driverSubmit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingDriver ? "Updating..." : "Creating..."}
                    </>
                  ) : editingDriver ? (
                    "Update Driver"
                  ) : (
                    "Create Driver"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDriverModal(false);
                    setEditingDriver(null);
                    resetDriverForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {editingStudent ? "Edit Student" : "Add New Student"}
            </h2>

            {editingStudent && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Editing Mode:</strong>
                  <br />• Firestore and Firebase Auth will both be updated
                  <br />• Email and username changes sync across both systems
                  <br />• Admin API ensures complete profile synchronization
                  <br />• User can continue using existing login credentials
                </p>
              </div>
            )}

            {!editingStudent && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-800">
                  <strong>Creating New Student:</strong>
                  <br />• Backend API creates Firebase Auth account securely
                  <br />• Firestore profile automatically linked to Auth account
                  <br />• Secure random password generated automatically
                  <br />• Student must change password on first login
                  <br />• All operations handled server-side for security
                </p>
              </div>
            )}

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={studentFormData.username}
                  onChange={(e) =>
                    setStudentFormData({
                      ...studentFormData,
                      username: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Student's full name"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  This will be displayed in Firebase Auth as the display name
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={studentFormData.email}
                  onChange={(e) =>
                    setStudentFormData({
                      ...studentFormData,
                      email: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="student@example.com"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  Used for Firebase Auth login
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loadingStates.studentSubmit}
                >
                  {loadingStates.studentSubmit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingStudent ? "Updating..." : "Creating..."}
                    </>
                  ) : editingStudent ? (
                    "Update Student"
                  ) : (
                    "Create Student"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setEditingStudent(null);
                    resetStudentForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Shuttle Modal */}
      {showAssignBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="rounded-t-xl border-b bg-blue-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xl text-blue-600">🚌</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Assign Shuttle
                  </h2>
                  <p className="text-sm text-gray-600">
                    {assigningDriver?.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 p-6">
              {/* Current Assignment */}
              {assigningDriver?.assignedShuttleId && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Current:</strong>{" "}
                    {getShuttleDetails(assigningDriver.assignedShuttleId)}
                  </p>
                </div>
              )}

              {/* Shuttle Selection */}
              <div>
                <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Select Shuttle
                </label>
                <select
                  value={assignBusFormData.assignedShuttleId}
                  onChange={(e) =>
                    setAssignBusFormData({ assignedShuttleId: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={shuttlesLoading}
                >
                  <option value="">
                    {shuttlesLoading ? "Loading..." : "Choose shuttle..."}
                  </option>
                  {availableShuttles.map((shuttle) => (
                    <option key={shuttle.id} value={shuttle.id}>
                      {shuttle.licensePlate} - {shuttle.model} (
                      {shuttle.capacity} seats)
                    </option>
                  ))}
                  {assigningDriver?.assignedShuttleId && (
                    <option value="">Remove Assignment</option>
                  )}
                </select>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Available: {availableShuttles.length}</span>
                <span>
                  Assigned: {drivers.filter((d) => d.assignedShuttleId).length}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 rounded-b-xl bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowAssignBusModal(false);
                  setAssigningDriver(null);
                  setAssignBusFormData({ assignedShuttleId: "" });
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignBus}
                disabled={loadingStates.assignBus}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingStates.assignBus ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    {assigningDriver?.assignedShuttleId
                      ? "Updating..."
                      : "Assigning..."}
                  </>
                ) : assigningDriver?.assignedShuttleId ? (
                  "Update"
                ) : (
                  "Assign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 w-full max-w-md rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">Reset User Password</h2>

            <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm text-orange-800">
                <strong>User:</strong> {resettingPasswordUser?.username}
                <br />
                <strong>Email:</strong> {resettingPasswordUser?.email}
                <br />
                <strong>Role:</strong> {resettingPasswordUser?.role}
                <br />
                <br />
                <strong>⚠️ Security Notice:</strong>
                <br />• This will immediately change the user&apos;s password
                <br />• The old password will no longer works
                <br />• Send the new password securely to the user
                <br />• Advise them to change it after login
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordResetData.newPassword}
                  onChange={(e) =>
                    setPasswordResetData({
                      ...passwordResetData,
                      newPassword: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordResetData.confirmPassword}
                  onChange={(e) =>
                    setPasswordResetData({
                      ...passwordResetData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="border-input bg-background text-foreground focus:ring-ring w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordResetData.newPassword &&
                passwordResetData.confirmPassword &&
                passwordResetData.newPassword !==
                  passwordResetData.confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    passwordResetData.newPassword !==
                      passwordResetData.confirmPassword ||
                    loadingStates.resetPassword
                  }
                >
                  {loadingStates.resetPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setResettingPasswordUser(null);
                    setPasswordResetData({
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="rounded-t-xl border-b bg-green-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <span className="text-xl text-green-600">✓</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Account Created
                  </h2>
                  <p className="text-sm text-gray-600">
                    {newUserInfo.role} account ready
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 p-6">
              {/* User Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Email
                  </label>
                  <div className="mt-1 rounded-lg border bg-gray-50 p-3">
                    <span className="font-mono text-sm text-gray-900">
                      {newUserInfo.email}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Username
                  </label>
                  <div className="mt-1 rounded-lg border bg-gray-50 p-3">
                    <span className="font-mono text-sm text-gray-900">
                      {newUserInfo.username}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Temporary Password
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={generatedPassword}
                      readOnly
                      className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-3 font-mono text-sm font-semibold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                        showToast.success("Password copied!");
                      }}
                      className="rounded-lg bg-amber-600 px-4 py-3 text-white transition-colors hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      title="Copy password"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> User must change password on first
                  login
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 rounded-b-xl bg-gray-50 px-6 py-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Email: ${newUserInfo.email}\nPassword: ${generatedPassword}`,
                  );
                  showToast.success("All credentials copied!");
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              >
                Copy All
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setGeneratedPassword("");
                  setNewUserInfo({ email: "", username: "", role: "" });
                }}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="rounded-t-xl border-b bg-red-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <span className="text-xl text-red-600">⚠️</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Delete{" "}
                    {showDeleteConfirm.type === "driver" ? "Driver" : "Student"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 p-6">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  <strong>User:</strong> {showDeleteConfirm.name}
                  <br />
                  <strong>Email:</strong> {showDeleteConfirm.email}
                  <br />
                  <strong>Type:</strong>{" "}
                  {showDeleteConfirm.type === "driver" ? "Driver" : "Student"}
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>⚠️ This will permanently delete:</strong>
                  <br />
                  • Firestore profile
                  <br />• Firebase Authentication account
                  {showDeleteConfirm.type === "driver" && (
                    <>
                      <br />• Bus assignment
                    </>
                  )}
                  <br />
                  <br />
                  <strong>This action cannot be undone!</strong>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 rounded-b-xl bg-gray-50 px-6 py-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm.type === "driver") {
                    confirmDeleteDriver();
                  } else {
                    confirmDeleteStudent();
                  }
                }}
                disabled={
                  loadingStates.deleteDriver || loadingStates.deleteStudent
                }
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingStates.deleteDriver || loadingStates.deleteStudent ? (
                  <>
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    Delete{" "}
                    {showDeleteConfirm.type === "driver" ? "Driver" : "Student"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
