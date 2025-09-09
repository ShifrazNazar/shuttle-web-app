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
      // In a real app, you'd fetch this from an API or database
      // For now, we'll use the static data structure
      const routesData: RouteData[] = [
        {
          routeId: "R001",
          routeName: "LRT Bukit Jalil to APU",
          origin: "LRT - BUKIT JALIL",
          destination: "APU",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: [
            "07:30",
            "07:40",
            "07:45",
            "07:50",
            "07:55",
            "08:00",
            "08:05",
            "08:15",
            "08:20",
            "08:25",
            "08:30",
            "08:35",
            "08:45",
            "09:00",
            "09:10",
            "09:20",
            "09:30",
            "09:50",
            "10:00",
            "10:05",
            "10:10",
            "10:15",
            "10:30",
            "10:35",
            "10:45",
            "11:00",
            "11:05",
            "11:10",
            "11:25",
            "11:40",
            "12:10",
            "12:30",
            "12:45",
            "13:00",
            "13:15",
            "13:20",
            "13:25",
            "13:40",
            "14:10",
            "14:25",
            "14:40",
            "15:05",
            "15:20",
            "15:40",
            "15:55",
            "16:10",
            "16:25",
            "17:10",
            "17:20",
            "17:30",
            "18:20",
          ],
        },
        {
          routeId: "R002",
          routeName: "APU to LRT Bukit Jalil",
          origin: "APU",
          destination: "LRT - BUKIT JALIL",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: [
            "10:35",
            "10:45",
            "11:30",
            "11:50",
            "12:10",
            "12:35",
            "12:50",
            "13:05",
            "13:10",
            "13:15",
            "13:30",
            "14:00",
            "14:15",
            "14:30",
            "14:45",
            "15:10",
            "15:20",
            "15:30",
            "15:45",
            "15:50",
            "16:00",
            "16:15",
            "16:30",
            "16:45",
            "16:50",
            "17:00",
            "17:10",
            "17:20",
            "17:30",
            "17:40",
            "18:00",
            "18:10",
            "18:15",
            "18:30",
            "18:40",
            "18:55",
            "19:15",
            "20:45",
            "21:45",
          ],
        },
        {
          routeId: "R003",
          routeName: "M Vertica to APU",
          origin: "M VERTICA",
          destination: "APU",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: ["07:45", "09:45", "11:15", "14:30"],
        },
        {
          routeId: "R004",
          routeName: "APU to M Vertica",
          origin: "APU",
          destination: "M VERTICA",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: ["14:00", "15:00", "16:45", "17:45", "18:45"],
        },
        {
          routeId: "R005",
          routeName: "City of Green to APU",
          origin: "CITY OF GREEN",
          destination: "APU",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: [
            "07:45",
            "08:20",
            "09:00",
            "09:45",
            "11:00",
            "12:00",
            "13:00",
            "15:00",
          ],
        },
        {
          routeId: "R006",
          routeName: "APU to City of Green",
          origin: "APU",
          destination: "CITY OF GREEN",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: [
            "10:35",
            "11:30",
            "12:30",
            "14:30",
            "15:30",
            "16:00",
            "16:30",
            "17:40",
            "18:00",
            "18:40",
            "19:00",
            "20:45",
            "21:45",
          ],
        },
        {
          routeId: "R007",
          routeName: "Bloomsvale to APU",
          origin: "BLOOMSVALE",
          destination: "APU",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: ["07:45", "10:15"],
        },
        {
          routeId: "R008",
          routeName: "APU to Bloomsvale",
          origin: "APU",
          destination: "BLOOMSVALE",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: ["15:30", "18:30"],
        },
        {
          routeId: "R009",
          routeName: "Fortune Park to APU",
          origin: "FORTUNE PARK",
          destination: "APU",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: [
            "08:00",
            "08:15",
            "09:00",
            "09:30",
            "10:00",
            "10:15",
            "11:00",
            "11:30",
            "12:00",
            "13:30",
            "14:40",
            "15:40",
            "16:20",
            "16:40",
            "17:40",
            "18:10",
          ],
        },
        {
          routeId: "R010",
          routeName: "APU to Fortune Park",
          origin: "APU",
          destination: "FORTUNE PARK",
          operatingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          schedule: [
            "10:30",
            "11:25",
            "13:00",
            "14:10",
            "15:00",
            "15:50",
            "16:20",
            "17:00",
            "17:40",
            "18:00",
            "18:40",
            "19:15",
          ],
        },
        {
          routeId: "R011",
          routeName: "APU to Mosque (Friday Only)",
          origin: "APU",
          destination: "MOSQUE",
          operatingDays: ["Friday"],
          schedule: ["12:30"],
          specialNotes: "Friday prayer service only",
        },
        {
          routeId: "R012",
          routeName: "Mosque to APU (Friday Only)",
          origin: "MOSQUE",
          destination: "APU",
          operatingDays: ["Friday"],
          schedule: ["13:30"],
          specialNotes: "Friday prayer service only",
        },
      ];

      const locationsData: LocationData[] = [
        {
          locationId: "L001",
          name: "APU",
          fullName: "Asia Pacific University",
          type: "university",
          coordinates: { latitude: 3.0474, longitude: 101.7002 },
        },
        {
          locationId: "L002",
          name: "LRT - BUKIT JALIL",
          fullName: "LRT Bukit Jalil Station",
          type: "transport_hub",
          coordinates: { latitude: 3.0365, longitude: 101.7011 },
        },
        {
          locationId: "L003",
          name: "M VERTICA",
          fullName: "M Vertica Residence",
          type: "residential",
          coordinates: { latitude: 3.052, longitude: 101.705 },
        },
        {
          locationId: "L004",
          name: "CITY OF GREEN",
          fullName: "City of Green Residence",
          type: "residential",
          coordinates: { latitude: 3.044, longitude: 101.698 },
        },
        {
          locationId: "L005",
          name: "BLOOMSVALE",
          fullName: "Bloomsvale Residence",
          type: "residential",
          coordinates: { latitude: 3.04, longitude: 101.71 },
        },
        {
          locationId: "L006",
          name: "FORTUNE PARK",
          fullName: "Fortune Park Residence",
          type: "residential",
          coordinates: { latitude: 3.05, longitude: 101.695 },
        },
        {
          locationId: "L007",
          name: "MOSQUE",
          fullName: "Local Mosque",
          type: "religious",
          coordinates: { latitude: 3.046, longitude: 101.702 },
        },
      ];

      setRoutes(routesData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error fetching routes data:", error);
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
    </div>
  );
}
