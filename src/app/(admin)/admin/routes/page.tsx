"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "~/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Route,
  Car,
  Bus,
  Navigation,
  Timer,
  AlertCircle,
} from "lucide-react";

interface RouteData {
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  operatingDays: string[];
  schedule: string[];
  specialNotes?: string;
}

interface Driver {
  id: string;
  uid: string;
  email: string;
  username: string;
  role: "driver";
  assignedShuttleId: string;
  assignedRouteId?: string;
}

interface LocationData {
  locationId: string;
  name: string;
  fullName: string;
  type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface RouteAssignment {
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

export default function RoutesPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assigningRoute, setAssigningRoute] = useState<RouteData | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [routeAssignments, setRouteAssignments] = useState<RouteAssignment[]>(
    [],
  );
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [addRouteLoading, setAddRouteLoading] = useState(false);
  const [newRoute, setNewRoute] = useState<Partial<RouteData>>({
    routeId: "",
    routeName: "",
    origin: "",
    destination: "",
    operatingDays: [],
    schedule: [],
    specialNotes: "",
  });
  const [currentAdminUser, setCurrentAdminUser] = useState<{
    id: string;
    email: string;
    username: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    fetchRoutesData();
    fetchDrivers();
    setupRouteAssignmentsListener();
    if (user) {
      fetchCurrentAdminUser();
    }
  }, [user]);

  // Refresh data when the page becomes visible (useful for updates from other tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDrivers();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchCurrentAdminUser = async () => {
    if (!user?.uid) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentAdminUser({
          id: userDoc.id,
          email: userData.email || user.email || "",
          username: userData.username || user.displayName || "Admin",
          role: userData.role || "admin",
        });
      } else {
        // If user document doesn't exist, create a basic admin user object
        setCurrentAdminUser({
          id: user.uid,
          email: user.email || "",
          username: user.displayName || "Admin",
          role: "admin",
        });
      }
    } catch (error) {
      console.error("Error fetching current admin user:", error);
      // Fallback to basic user info
      setCurrentAdminUser({
        id: user.uid,
        email: user.email || "",
        username: user.displayName || "Admin",
        role: "admin",
      });
    }
  };

  const setupRouteAssignmentsListener = () => {
    const assignmentsRef = collection(db, "routeAssignments");
    const assignmentsQuery = query(
      assignmentsRef,
      where("status", "==", "active"),
    );

    const unsubscribe = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const assignments: RouteAssignment[] = [];
        snapshot.forEach((doc) => {
          assignments.push({
            id: doc.id,
            ...doc.data(),
          } as RouteAssignment);
        });

        setRouteAssignments(assignments);
        setAssignmentsLoading(false);
      },
      (error) => {
        console.error("Error listening to route assignments:", error);
        setAssignmentsLoading(false);
      },
    );

    return unsubscribe;
  };

  const fetchRoutesData = async () => {
    try {
      // Fetch routes from Firestore
      const routesRef = collection(db, "routes");
      const routesSnapshot = await getDocs(routesRef);
      const routesData: RouteData[] = routesSnapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as RouteData[];

      // Fetch locations from Firestore
      const locationsRef = collection(db, "locations");
      const locationsSnapshot = await getDocs(locationsRef);
      const locationsData: LocationData[] = locationsSnapshot.docs.map(
        (doc) => ({
          ...doc.data(),
        }),
      ) as LocationData[];

      setRoutes(routesData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error fetching routes data:", error);
      toast.error("Failed to load routes data. Please try again.");
    }
  };

  const fetchDrivers = async () => {
    try {
      const driversRef = collection(db, "users");
      const driversQuery = query(driversRef, where("role", "==", "driver"));
      const driversSnapshot = await getDocs(driversQuery);
      const driversData = driversSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Driver[];

      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = (locationCode: string) => {
    const location = locations.find((loc) => loc.name === locationCode);
    return location ? location.fullName : locationCode;
  };

  const handleAssignDriver = (route: RouteData) => {
    setAssigningRoute(route);
    setSelectedDriverId("");
    setShowAssignmentModal(true);
  };

  const assignRouteToDriver = async () => {
    if (!assigningRoute || !selectedDriverId) return;
    if (!currentAdminUser) {
      toast.error(
        "Admin user information not available. Please refresh the page.",
      );
      return;
    }
    if (currentAdminUser.role !== "admin") {
      toast.error(
        "You don't have permission to assign routes. Admin access required.",
      );
      return;
    }

    setAssignmentLoading(true);
    try {
      const selectedDriver = drivers.find((d) => d.id === selectedDriverId);
      if (!selectedDriver) throw new Error("Driver not found");

      // Check if route already has assignments
      const existingAssignments = routeAssignments.filter(
        (a) => a.routeId === assigningRoute.routeId,
      );

      // Create new assignment document
      const assignmentData: Omit<RouteAssignment, "id"> = {
        routeId: assigningRoute.routeId,
        routeName: assigningRoute.routeName,
        driverId: selectedDriver.id,
        driverEmail: selectedDriver.email,
        driverUsername: selectedDriver.username,
        busId: selectedDriver.assignedShuttleId,
        assignedAt: Timestamp.now(),
        status: "active",
        assignedBy:
          currentAdminUser?.username || currentAdminUser?.email || "admin",
        priority: existingAssignments.length + 1, // Assign priority based on order
      };

      // Check if driver is already assigned to this specific route
      const driverAlreadyAssignedToThisRoute = existingAssignments.find(
        (a) => a.driverId === selectedDriver.id && a.status === "active",
      );

      if (driverAlreadyAssignedToThisRoute) {
        toast.error("This driver is already assigned to this route.");
        return;
      }

      // Check if driver has too many route assignments (optional limit)
      const driverTotalAssignments = routeAssignments.filter(
        (a) => a.driverId === selectedDriver.id && a.status === "active",
      );

      if (driverTotalAssignments.length >= 3) {
        toast.warning("Driver has many route assignments", {
          description: `${selectedDriver.username} is already assigned to ${driverTotalAssignments.length} routes. Consider workload balance.`,
        });
        // Continue with assignment but show warning
      }

      // Create new assignment
      const assignmentRef = doc(collection(db, "routeAssignments"));
      await setDoc(assignmentRef, assignmentData);

      setShowAssignmentModal(false);
      setAssigningRoute(null);
      setSelectedDriverId("");

      toast.success(
        `Route ${assigningRoute.routeName} assigned to ${selectedDriver.username} successfully!`,
      );
    } catch (error) {
      console.error("Error assigning route:", error);
      toast.error("Failed to assign route. Please try again.");
    } finally {
      setAssignmentLoading(false);
    }
  };

  const getAvailableDrivers = () => {
    return drivers.filter(
      (driver) =>
        driver.assignedShuttleId && // Must have a bus assigned
        // Allow drivers to be assigned to multiple routes
        // Only check if they're already assigned to THIS specific route
        !routeAssignments.some(
          (a) =>
            a.driverId === driver.id &&
            a.status === "active" &&
            a.routeId === assigningRoute?.routeId,
        ),
    );
  };

  const getDriversByRouteId = (routeId: string) => {
    const assignments = routeAssignments.filter((a) => a.routeId === routeId);
    if (assignments.length === 0) return [];

    return assignments.map((assignment) => ({
      id: assignment.driverId,
      email: assignment.driverEmail,
      username: assignment.driverUsername,
      assignedShuttleId: assignment.busId,
      assignedRouteId: assignment.routeId,
      priority: assignment.priority || 1,
    }));
  };

  const getDriverRouteAssignments = (driverId: string) => {
    return routeAssignments.filter(
      (a) => a.driverId === driverId && a.status === "active",
    );
  };

  const getRelatedRoutes = (route: RouteData) => {
    // Find routes that are the reverse of this route (e.g., APU to LRT and LRT to APU)
    return routes.filter(
      (otherRoute) =>
        otherRoute.routeId !== route.routeId &&
        otherRoute.origin === route.destination &&
        otherRoute.destination === route.origin,
    );
  };

  const handleDeleteConfirm = (routeId: string, driverId?: string) => {
    setShowDeleteConfirm(driverId ? `${routeId}-${driverId}` : routeId);
  };

  const deleteRouteAssignment = async (routeId: string, driverId?: string) => {
    if (!showDeleteConfirm) return;
    if (!currentAdminUser) {
      toast.error(
        "Admin user information not available. Please refresh the page.",
      );
      return;
    }
    if (currentAdminUser.role !== "admin") {
      toast.error(
        "You don't have permission to delete route assignments. Admin access required.",
      );
      return;
    }

    try {
      let assignment;
      if (driverId) {
        // Delete specific driver assignment
        assignment = routeAssignments.find(
          (a) => a.routeId === routeId && a.driverId === driverId,
        );
        if (!assignment) {
          toast.error("No assignment found for this driver on this route.");
          return;
        }
      } else {
        // Delete all assignments for the route
        assignment = routeAssignments.find((a) => a.routeId === routeId);
        if (!assignment) {
          toast.error("No assignment found for this route.");
          return;
        }
      }

      // Delete the assignment document permanently
      await deleteDoc(doc(db, "routeAssignments", assignment.id));

      const message = driverId
        ? `Driver assignment removed successfully!`
        : "Route assignment deleted successfully!";
      toast.success(message);
    } catch (error) {
      console.error("Error deleting route assignment:", error);
      toast.error("Failed to delete route assignment. Please try again.");
    }
  };

  const getRouteStatus = (route: RouteData) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const isOperatingToday = route.operatingDays.includes(today);

    if (!isOperatingToday)
      return { status: "inactive", text: "Not Operating Today" };

    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const nextDeparture = route.schedule.find((time) => time > currentTime);
    if (nextDeparture) {
      return { status: "active", text: `Next: ${nextDeparture}` };
    }

    return { status: "completed", text: "Service Ended" };
  };

  const generateRouteId = () => {
    const existingIds = routes.map((route) => route.routeId);
    let routeNumber = 1;
    let newId = `R${routeNumber.toString().padStart(3, "0")}`;

    while (existingIds.includes(newId)) {
      routeNumber++;
      newId = `R${routeNumber.toString().padStart(3, "0")}`;
    }

    return newId;
  };

  const handleAddRoute = () => {
    setNewRoute({
      routeId: generateRouteId(),
      routeName: "",
      origin: "",
      destination: "",
      operatingDays: [],
      schedule: ["08:00"], // Add a default schedule time
      specialNotes: "",
    });
    setShowAddRouteModal(true);
  };

  const addRoute = async () => {
    if (!currentAdminUser) {
      toast.error(
        "Admin user information not available. Please refresh the page.",
      );
      return;
    }
    if (currentAdminUser.role !== "admin") {
      toast.error(
        "You don't have permission to add routes. Admin access required.",
      );
      return;
    }

    // Validate required fields
    if (!newRoute.routeName?.trim()) {
      toast.error("Route name is required");
      return;
    }
    if (!newRoute.origin?.trim()) {
      toast.error("Origin location is required");
      return;
    }
    if (!newRoute.destination?.trim()) {
      toast.error("Destination location is required");
      return;
    }
    if (!newRoute.operatingDays || newRoute.operatingDays.length === 0) {
      toast.error("At least one operating day must be selected");
      return;
    }
    if (!newRoute.schedule || newRoute.schedule.length === 0) {
      toast.error("At least one schedule time must be added");
      return;
    }

    setAddRouteLoading(true);
    try {
      const routeData = {
        routeId: newRoute.routeId!,
        routeName: newRoute.routeName!.trim(),
        origin: newRoute.origin!.trim(),
        destination: newRoute.destination!.trim(),
        operatingDays: newRoute.operatingDays!,
        schedule: newRoute.schedule!,
        isActive: true,
        createdAt: Timestamp.now(),
        // Only include specialNotes if it has a value
        ...(newRoute.specialNotes?.trim() && {
          specialNotes: newRoute.specialNotes.trim(),
        }),
      };

      // Check if route ID already exists
      const existingRouteDoc = await getDoc(
        doc(db, "routes", routeData.routeId),
      );
      if (existingRouteDoc.exists()) {
        throw new Error(`Route with ID ${routeData.routeId} already exists`);
      }

      // Add route to Firestore
      await setDoc(doc(db, "routes", routeData.routeId), routeData);

      // Refresh routes data
      await fetchRoutesData();

      setShowAddRouteModal(false);
      setNewRoute({
        routeId: "",
        routeName: "",
        origin: "",
        destination: "",
        operatingDays: [],
        schedule: [],
        specialNotes: "",
      });

      toast.success(`Route "${routeData.routeName}" added successfully!`);
    } catch (error) {
      console.error("Error adding route:", error);
      toast.error(
        `Failed to add route: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setAddRouteLoading(false);
    }
  };

  const addScheduleTime = () => {
    setNewRoute((prev) => ({
      ...prev,
      schedule: [...(prev.schedule || []), "08:00"],
    }));
  };

  const removeScheduleTime = (index: number) => {
    setNewRoute((prev) => ({
      ...prev,
      schedule: prev.schedule?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateScheduleTime = (index: number, time: string) => {
    setNewRoute((prev) => ({
      ...prev,
      schedule: prev.schedule?.map((t, i) => (i === index ? time : t)) || [],
    }));
  };

  const toggleOperatingDay = (day: string) => {
    setNewRoute((prev) => ({
      ...prev,
      operatingDays: prev.operatingDays?.includes(day)
        ? prev.operatingDays.filter((d) => d !== day)
        : [...(prev.operatingDays || []), day],
    }));
  };

  if (loading || assignmentsLoading || !currentAdminUser) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Routes</h1>
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Route className="h-6 w-6 text-blue-600" />
            Shuttle Routes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and monitor all shuttle routes across the campus network
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Logged in as: {currentAdminUser.username} ({currentAdminUser.role})
            {currentAdminUser.role !== "admin" && (
              <span className="ml-2 font-medium text-amber-600">
                ⚠️ Limited access - Admin privileges required for route
                management
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentAdminUser?.role !== "admin"}
            title={
              currentAdminUser?.role !== "admin"
                ? "Admin access required"
                : "Export route data"
            }
          >
            <Navigation className="mr-2 h-4 w-4" />
            Export Routes
          </Button>
          <Button
            onClick={handleAddRoute}
            disabled={currentAdminUser?.role !== "admin"}
            title={
              currentAdminUser?.role !== "admin"
                ? "Admin access required"
                : "Add a new shuttle route"
            }
          >
            <Route className="mr-2 h-4 w-4" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Route Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Route className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-muted-foreground text-xs">
              Active shuttle routes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Routes
            </CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeAssignments.length}</div>
            <p className="text-muted-foreground text-xs">
              Total driver assignments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Routes with Drivers
            </CardTitle>
            <Route className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(routeAssignments.map((a) => a.routeId)).size}
            </div>
            <p className="text-muted-foreground text-xs">
              Routes with active drivers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Daily Departures
            </CardTitle>
            <Clock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes.reduce(
                (total, route) => total + route.schedule.length,
                0,
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Total scheduled departures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-muted-foreground text-xs">
              Pickup and drop-off points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Routes Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {routes.map((route) => {
          const routeStatus = getRouteStatus(route);

          return (
            <Card
              key={route.routeId}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="h-5 w-5 text-blue-600" />
                      {route.routeName}
                    </CardTitle>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {getLocationName(route.origin)} →{" "}
                      {getLocationName(route.destination)}
                    </div>
                  </div>
                  <Badge
                    variant={
                      routeStatus.status === "active"
                        ? "default"
                        : routeStatus.status === "completed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {routeStatus.text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Operating Days */}
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div className="flex flex-wrap gap-1">
                    {route.operatingDays.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day.slice(0, 3)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-medium">
                      {route.schedule.length} departures daily
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {route.schedule.slice(0, 6).map((time, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {time}
                        </Badge>
                      ))}
                      {route.schedule.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{route.schedule.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver Assignment */}
                <div className="flex items-center gap-2">
                  <Car className="text-muted-foreground h-4 w-4" />
                  <div className="flex-1">
                    {(() => {
                      const assignedDrivers = getDriversByRouteId(
                        route.routeId,
                      );
                      return assignedDrivers.length > 0 ? (
                        <div className="space-y-2">
                          {assignedDrivers.map((driver, index) => (
                            <div
                              key={driver.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">
                                  {driver.username}
                                </Badge>
                                <span className="text-muted-foreground text-sm">
                                  Bus {driver.assignedShuttleId}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteConfirm(route.routeId, driver.id)
                                }
                                className="text-red-600 hover:text-red-700"
                                disabled={currentAdminUser?.role !== "admin"}
                                title="Remove driver"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            No drivers
                          </Badge>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Special Notes */}
                {route.specialNotes && (
                  <div className="text-xs text-amber-600">
                    ⚠️ {route.specialNotes}
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAssignDriver(route)}
                    disabled={currentAdminUser?.role !== "admin"}
                    title="Assign a driver to this route"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Assign Driver
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Route Assignment Modal */}
      {showAssignmentModal && assigningRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 w-full max-w-md rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Assign Driver to Route
            </h2>

            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Route:</strong> {assigningRoute.routeName}
                <br />
                <strong>Origin:</strong>{" "}
                {getLocationName(assigningRoute.origin)}
                <br />
                <strong>Destination:</strong>{" "}
                {getLocationName(assigningRoute.destination)}
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Select Driver *
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                required
              >
                <option value="">Choose a driver...</option>
                {getAvailableDrivers().map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.username} - Bus {driver.assignedShuttleId}
                  </option>
                ))}
              </select>

              {getAvailableDrivers().length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  No available drivers. All drivers with bus assignments are
                  already assigned to routes.
                </p>
              )}

              {/* Current Assignment Info */}
              {(() => {
                const currentDrivers = getDriversByRouteId(
                  assigningRoute.routeId,
                );
                return currentDrivers.length > 0 ? (
                  <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Current Drivers:</strong> {currentDrivers.length}
                      <br />
                      <span className="text-xs">
                        You can assign more drivers to this route.
                      </span>
                    </p>
                  </div>
                ) : null;
              })()}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={assignRouteToDriver}
                disabled={!selectedDriverId || assignmentLoading}
                className="flex-1"
              >
                {assignmentLoading ? "Assigning..." : "Assign Driver"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignmentModal(false);
                  setAssigningRoute(null);
                  setSelectedDriverId("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 w-full max-w-md rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold text-red-600">
              {showDeleteConfirm.includes("-")
                ? "Remove Driver Assignment"
                : "Delete Route Assignment"}
            </h2>

            <p className="text-muted-foreground mb-6">
              {showDeleteConfirm.includes("-")
                ? "Are you sure you want to remove this driver from the route? This action cannot be undone."
                : "Are you sure you want to delete all route assignments? This action cannot be undone and all assignments will be permanently removed."}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  const parts = showDeleteConfirm.split("-");
                  const routeId = parts[0];
                  const driverId = parts[1];
                  if (routeId) {
                    if (driverId) {
                      await deleteRouteAssignment(routeId, driverId);
                    } else {
                      await deleteRouteAssignment(routeId);
                    }
                  }
                  setShowDeleteConfirm(null);
                }}
                className="flex-1"
              >
                {showDeleteConfirm.includes("-")
                  ? "Remove Driver"
                  : "Delete All Assignments"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6">
            <h2 className="mb-4 text-xl font-semibold">Add New Route</h2>

            <div className="space-y-4">
              {/* Route ID (Auto-generated) */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Route ID (Auto-generated)
                </label>
                <input
                  type="text"
                  value={newRoute.routeId}
                  disabled
                  className="border-input bg-muted w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              {/* Route Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Route Name *
                </label>
                <input
                  type="text"
                  value={newRoute.routeName || ""}
                  onChange={(e) =>
                    setNewRoute((prev) => ({
                      ...prev,
                      routeName: e.target.value,
                    }))
                  }
                  placeholder="e.g., LRT Bukit Jalil to APU"
                  className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                  required
                />
              </div>

              {/* Origin and Destination */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Origin Location *
                  </label>
                  <select
                    value={newRoute.origin || ""}
                    onChange={(e) =>
                      setNewRoute((prev) => ({
                        ...prev,
                        origin: e.target.value,
                      }))
                    }
                    className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                    required
                  >
                    <option value="">Select origin...</option>
                    {locations.map((location) => (
                      <option key={location.locationId} value={location.name}>
                        {location.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Destination Location *
                  </label>
                  <select
                    value={newRoute.destination || ""}
                    onChange={(e) =>
                      setNewRoute((prev) => ({
                        ...prev,
                        destination: e.target.value,
                      }))
                    }
                    className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                    required
                  >
                    <option value="">Select destination...</option>
                    {locations.map((location) => (
                      <option key={location.locationId} value={location.name}>
                        {location.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Operating Days */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Operating Days *
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleOperatingDay(day)}
                      className={`rounded-md border px-3 py-1 text-sm ${
                        newRoute.operatingDays?.includes(day)
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "bg-background text-foreground border-input hover:bg-muted"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {newRoute.operatingDays &&
                  newRoute.operatingDays.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      Select at least one operating day
                    </p>
                  )}
              </div>

              {/* Schedule Times */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Schedule Times *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addScheduleTime}
                  >
                    <Timer className="mr-1 h-3 w-3" />
                    Add Time
                  </Button>
                </div>
                <div className="space-y-2">
                  {newRoute.schedule?.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) =>
                          updateScheduleTime(index, e.target.value)
                        }
                        className="border-input bg-background focus:ring-ring w-32 rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeScheduleTime(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                {(!newRoute.schedule || newRoute.schedule.length === 0) && (
                  <p className="mt-1 text-sm text-red-600">
                    Add at least one schedule time
                  </p>
                )}
              </div>

              {/* Special Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Special Notes (Optional)
                </label>
                <textarea
                  value={newRoute.specialNotes || ""}
                  onChange={(e) =>
                    setNewRoute((prev) => ({
                      ...prev,
                      specialNotes: e.target.value,
                    }))
                  }
                  placeholder="e.g., Only operates during exam periods"
                  className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-6">
              <Button
                onClick={addRoute}
                disabled={addRouteLoading}
                className="flex-1"
              >
                {addRouteLoading ? "Adding Route..." : "Add Route"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddRouteModal(false);
                  setNewRoute({
                    routeId: "",
                    routeName: "",
                    origin: "",
                    destination: "",
                    operatingDays: [],
                    schedule: [],
                    specialNotes: "",
                  });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
