"use client";

import { useMemo } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { MapPin, Users, Activity, Loader2, Car, Route } from "lucide-react";

import { env } from "~/env";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useShuttles } from "~/hooks/use-shuttles";
import { useActiveDrivers } from "~/hooks/use-active-drivers";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/lib/firebaseClient";

export default function AdminDashboardPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const { shuttles = [], error: shuttlesError } = useShuttles();

  const { activeDrivers = [], loading: driversLoading } = useActiveDrivers();

  // Real data state
  const [routes, setRoutes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const center = useMemo(() => ({ lat: 3.055465, lng: 101.700363 }), []); // Asia Pacific University of Technology & Innovation

  // Real data calculations
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter((r) => r.isActive !== false).length;
  const totalDrivers = users.filter((u) => u.role === "driver").length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const assignedShuttles = shuttles.filter((s) => s.driverId).length;
  const availableShuttles = shuttles.filter(
    (s) => s.status === "active" && !s.driverId,
  ).length;

  // Fetch real data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch routes
        const routesSnapshot = await getDocs(collection(db, "routes"));
        const routesData = routesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(routesData);

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);

        // Note: routeAssignments removed as it was unused
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isLoaded || loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">
            {!isLoaded ? "Loading map..." : "Loading dashboard data..."}
          </p>
        </div>
      </div>
    );
  }

  if (shuttlesError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load shuttle data</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {typeof shuttlesError === "string"
              ? shuttlesError
              : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Badge variant="outline" className="text-xs">
          Live Data
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Tracking</CardTitle>
            <Activity className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrivers.length}</div>
            <p className="text-muted-foreground text-xs">
              {activeDrivers.length} drivers currently sharing location
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-muted-foreground text-xs">
              {totalDrivers} drivers, {totalStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shuttle Fleet</CardTitle>
            <Car className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedShuttles}/{shuttles.length}
            </div>
            <p className="text-muted-foreground text-xs">
              {assignedShuttles} assigned, {availableShuttles} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoutes}</div>
            <p className="text-muted-foreground text-xs">
              {activeRoutes} of {totalRoutes} routes operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Live Shuttle Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[60vh] w-full overflow-hidden rounded-md">
              <GoogleMap
                zoom={16}
                center={center}
                mapContainerClassName="h-full w-full"
              >
                {activeDrivers.map((driver) => (
                  <Marker
                    key={driver.driverId}
                    position={{
                      lat: driver.latitude,
                      lng: driver.longitude,
                    }}
                    title={`${driver.busId} - ${driver.driverEmail || "Unknown Driver"}`}
                  />
                ))}
              </GoogleMap>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Shuttle Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {driversLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Loading active drivers...
                  </span>
                </div>
              ) : activeDrivers.length === 0 ? (
                <div className="py-8 text-center">
                  <Car className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    No drivers currently sharing location
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Drivers need to start location tracking in their app
                  </p>
                </div>
              ) : (
                activeDrivers.map((driver) => {
                  // Find shuttle details
                  const shuttle = shuttles.find((s) => s.id === driver.busId);
                  return (
                    <div
                      key={driver.driverId}
                      className="flex items-center justify-between rounded-lg border bg-green-50 p-3"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <p className="font-medium">Bus {driver.busId}</p>
                          {shuttle && (
                            <Badge variant="outline" className="text-xs">
                              {shuttle.licensePlate}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Driver: {driver.driverEmail || "Unknown"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Last update:{" "}
                          {new Date(driver.timestamp).toLocaleTimeString()}
                        </p>
                        {shuttle && (
                          <p className="text-muted-foreground text-xs">
                            {shuttle.model} ({shuttle.capacity} seats)
                          </p>
                        )}
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Live
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Routes
                </span>
                <span className="font-medium">{totalRoutes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Active Routes
                </span>
                <span className="font-medium text-green-600">
                  {activeRoutes}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Fleet Size
                </span>
                <span className="font-medium">{shuttles.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Assigned Shuttles
                </span>
                <span className="font-medium text-blue-600">
                  {assignedShuttles}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Available Shuttles
                </span>
                <span className="font-medium text-orange-600">
                  {availableShuttles}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
