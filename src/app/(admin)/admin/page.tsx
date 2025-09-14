"use client";

import { useMemo } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import {
  MapPin,
  Users,
  Clock,
  Activity,
  Loader2,
  Car,
  Route,
  UserCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { env } from "~/env";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useShuttles } from "~/hooks/use-shuttles";
import { useActiveDrivers } from "~/hooks/use-active-drivers";
import { useAIAnalytics } from "~/hooks/use-ai-analytics";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import { Bot, Sparkles, Lightbulb, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const {
    shuttles = [],
    loading: shuttlesLoading,
    error: shuttlesError,
  } = useShuttles();

  const {
    activeDrivers = [],
    loading: driversLoading,
    error: driversError,
  } = useActiveDrivers();

  // Real data state
  const [routes, setRoutes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [routeAssignments, setRouteAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Analytics hook
  const {
    insights,
    predictions,
    recommendations,
    loading: aiLoading,
    generateInsights,
    generatePredictions,
    generateRecommendations,
  } = useAIAnalytics();

  const center = useMemo(() => ({ lat: 3.055465, lng: 101.700363 }), []); // Asia Pacific University of Technology & Innovation
  const activeShuttles = shuttles.filter((s) => s.status === "active");

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

        // Fetch route assignments
        const assignmentsSnapshot = await getDocs(
          collection(db, "routeAssignments"),
        );
        const assignmentsData = assignmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRouteAssignments(assignmentsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate AI insights when data is loaded
  useEffect(() => {
    if (routes.length > 0 && users.length > 0 && shuttles.length > 0) {
      const analyticsData = {
        totalRoutes: routes.length,
        totalDrivers: users.filter((u) => u.role === "driver").length,
        totalStudents: users.filter((u) => u.role === "student").length,
        activeShuttles: shuttles.filter((s) => s.status === "active").length,
        assignedShuttles: shuttles.filter((s) => s.driverId).length,
        availableShuttles: shuttles.filter(
          (s) => s.status === "active" && !s.driverId,
        ).length,
        activeDrivers: activeDrivers.length,
        routes,
        shuttles,
        users,
        routeAssignments,
      };

      void generateInsights(analyticsData);
      void generatePredictions(analyticsData);
      void generateRecommendations(analyticsData);
    }
  }, [
    routes,
    users,
    shuttles,
    activeDrivers,
    routeAssignments,
    generateInsights,
    generatePredictions,
    generateRecommendations,
  ]);

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

          {/* AI Insights */}
          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${
                      insight.type === "success"
                        ? "border-green-200 bg-green-50"
                        : insight.type === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : insight.type === "info"
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {insight.type === "success" ? (
                        <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                      ) : insight.type === "warning" ? (
                        <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
                      ) : insight.type === "info" ? (
                        <Activity className="mt-0.5 h-4 w-4 text-blue-600" />
                      ) : (
                        <Activity className="mt-0.5 h-4 w-4 text-gray-600" />
                      )}
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="text-sm font-medium">
                            {insight.title}
                          </h4>
                          <Badge
                            variant={
                              insight.priority === "high"
                                ? "destructive"
                                : insight.priority === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {insights.length > 3 && (
                  <div className="text-center">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() =>
                        (window.location.href = "/admin/analytics")
                      }
                    >
                      View all {insights.length} insights →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Predictions */}
          {predictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  AI Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {predictions.slice(0, 2).map((prediction, index) => (
                  <div key={index} className="rounded-lg border bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        {prediction.metric}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {prediction.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        Current: {prediction.currentValue}
                      </span>
                      <span className="font-medium text-green-600">
                        → {prediction.predictedValue}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {prediction.timeframe}
                    </p>
                  </div>
                ))}
                {predictions.length > 2 && (
                  <div className="text-center">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() =>
                        (window.location.href = "/admin/analytics")
                      }
                    >
                      View all predictions →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-3 py-2 text-sm"
                onClick={() => (window.location.href = "/admin/routes")}
              >
                Manage Routes
              </button>
              <button
                className="hover:bg-muted w-full rounded-md border px-3 py-2 text-sm"
                onClick={() => (window.location.href = "/admin/shuttles")}
              >
                Manage Shuttles
              </button>
              <button
                className="hover:bg-muted w-full rounded-md border px-3 py-2 text-sm"
                onClick={() => (window.location.href = "/admin/users")}
              >
                Manage Users
              </button>
              <button
                className="hover:bg-muted w-full rounded-md border px-3 py-2 text-sm"
                onClick={() => (window.location.href = "/admin/analytics")}
              >
                <Bot className="mr-2 inline h-4 w-4" />
                AI Analytics
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
