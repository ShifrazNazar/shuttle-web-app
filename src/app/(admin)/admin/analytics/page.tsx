"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { AnalyticsData } from "~/types";
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import { Users, Bus, Activity, BarChart3, Download, Route } from "lucide-react";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAnalyticsData();
  }, []);

  // No automatic AI generation for analytics

  // Helper function to get shuttle info by ID
  const getShuttleInfo = (shuttleId: string, shuttles: any[]) => {
    return shuttles.find((s) => s.id === shuttleId);
  };

  const fetchAnalyticsData = async () => {
    try {
      // Fetch all data from Firestore collections
      const [
        routesSnapshot,
        usersSnapshot,
        shuttlesSnapshot,
        assignmentsSnapshot,
        boardingRecordsSnapshot,
        digitalTravelCardsSnapshot,
        locationsSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "routes")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "shuttles")),
        getDocs(collection(db, "routeAssignments")),
        getDocs(collection(db, "boardingRecords")),
        getDocs(collection(db, "digitalTravelCards")),
        getDocs(collection(db, "locations")),
      ]);

      const routes = routesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as any,
      );
      const users = usersSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as any,
      );
      const shuttles = shuttlesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as any,
      );
      const routeAssignments = assignmentsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as any,
      );
      const boardingRecords = boardingRecordsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as any,
      );
      const digitalTravelCards = digitalTravelCardsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as any,
      );
      const locations = locationsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as any,
      );

      // Calculate assigned shuttles using both approaches for consistency
      const driversWithShuttles = users.filter(
        (u) => u.role === "driver" && u.assignedShuttleId,
      );
      const shuttlesWithDrivers = shuttles.filter((s) => s.driverId);

      // Get unique assigned shuttle count (combine both approaches)
      const assignedShuttleIds = new Set([
        ...driversWithShuttles.map((d) => d.assignedShuttleId),
        ...shuttlesWithDrivers.map((s) => s.id),
      ]);

      const analyticsData: AnalyticsData = {
        totalRoutes: routes.length,
        totalDrivers: users.filter((u) => u.role === "driver").length,
        totalStudents: users.filter((u) => u.role === "student").length,
        activeShuttles: shuttles.filter((s) => s.status === "active").length,
        assignedShuttles: assignedShuttleIds.size,
        availableShuttles: shuttles.filter(
          (s) => s.status === "active" && !s.driverId,
        ).length,
        activeDrivers: 0, // This would come from real-time data
        routes,
        shuttles,
        users,
        routeAssignments,
        boardingRecords,
        digitalTravelCards,
        locations,
      };

      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            System Overview & Performance
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time system monitoring, operational metrics, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <Activity className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Fleet Status</span>
              </div>
              <p className="mt-1 text-sm text-blue-700">
                {analyticsData.assignedShuttles} of{" "}
                {analyticsData.activeShuttles} shuttles active
              </p>
            </div>
            <div className="rounded-lg border bg-purple-50 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium">User Activity</span>
              </div>
              <p className="mt-1 text-sm text-purple-700">
                {analyticsData.totalStudents + analyticsData.totalDrivers} total
                users
              </p>
            </div>
            <div className="rounded-lg border bg-orange-50 p-4">
              <div className="flex items-center gap-2">
                <Route className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Route Coverage</span>
              </div>
              <p className="mt-1 text-sm text-orange-700">
                {analyticsData.totalRoutes} active routes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Route className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalRoutes}
            </div>
            <p className="text-muted-foreground text-xs">
              Active routes in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalDrivers + analyticsData.totalStudents}
            </div>
            <p className="text-muted-foreground text-xs">
              {analyticsData.totalDrivers} drivers,{" "}
              {analyticsData.totalStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shuttle Fleet</CardTitle>
            <Bus className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.assignedShuttles}/{analyticsData.activeShuttles}
            </div>
            <p className="text-muted-foreground text-xs">
              {analyticsData.assignedShuttles} assigned,{" "}
              {analyticsData.availableShuttles} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Boarding Records
            </CardTitle>
            <Activity className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.boardingRecords.length}
            </div>
            <p className="text-muted-foreground text-xs">
              Total passenger boardings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Digital Travel Card Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Digital Travel Card Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analyticsData.digitalTravelCards.length}
              </div>
              <p className="text-sm text-gray-600">Total Cards Issued</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {
                  analyticsData.digitalTravelCards.filter(
                    (card: any) => card.isActive,
                  ).length
                }
              </div>
              <p className="text-sm text-gray-600">Active Cards</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(
                  (analyticsData.digitalTravelCards.filter(
                    (card: any) => card.isActive,
                  ).length /
                    Math.max(analyticsData.digitalTravelCards.length, 1)) *
                    100,
                )}
                %
              </div>
              <p className="text-sm text-gray-600">Adoption Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-blue-600" />
              Route Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {analyticsData.routes.length > 0 ? (
                analyticsData.routes.slice(0, 5).map((route, index) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">
                        {route.routeName || `Route ${route.id}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {route.isActive !== false ? "Active" : "Inactive"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {route.stops?.length || 0} stops
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No routes available
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-green-600" />
              Shuttle Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.shuttles.length > 0 ? (
                analyticsData.shuttles.slice(0, 5).map((shuttle, index) => {
                  // Find driver assigned to this shuttle using both approaches
                  const driverByShuttleId = analyticsData.users.find(
                    (u) => u.assignedShuttleId === shuttle.id,
                  );
                  const driverByDriverId = shuttle.driverId
                    ? analyticsData.users.find((u) => u.id === shuttle.driverId)
                    : null;
                  const assignedDriver = driverByShuttleId || driverByDriverId;

                  return (
                    <div
                      key={shuttle.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-600">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">
                          {shuttle.licensePlate || shuttle.id}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {shuttle.status || "Unknown"}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {assignedDriver
                            ? `Driver: ${assignedDriver.username || assignedDriver.email}`
                            : `${shuttle.capacity || 0} seats`}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    No shuttles available
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-green-600" />
            Route Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Driver</th>
                  <th className="p-3 text-left font-medium">Route</th>
                  <th className="p-3 text-left font-medium">Shuttle</th>
                  <th className="p-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.routeAssignments.length > 0 ? (
                  analyticsData.routeAssignments.map((assignment) => {
                    const driver = analyticsData.users.find(
                      (u) => u.id === assignment.driverId,
                    );
                    const route = analyticsData.routes.find(
                      (r) => r.id === assignment.routeId,
                    );

                    // Use the same logic as users page - check both assignment.shuttleId and driver.assignedShuttleId
                    const shuttleId =
                      assignment.shuttleId || driver?.assignedShuttleId;
                    const shuttle = shuttleId
                      ? getShuttleInfo(shuttleId, analyticsData.shuttles)
                      : null;

                    return (
                      <tr
                        key={assignment.id}
                        className="hover:bg-muted/50 border-b"
                      >
                        <td className="p-3">
                          <div>
                            <div className="font-medium">
                              {driver?.name ||
                                driver?.email ||
                                "Unknown Driver"}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {driver?.email || "No email"}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">
                              {route?.routeName ||
                                `Route ${assignment.routeId}`}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {route?.stops?.length || 0} stops
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">
                              {shuttle?.licensePlate ||
                                shuttle?.id ||
                                "No shuttle"}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {shuttle?.model || "Unknown model"}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            {assignment.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-muted-foreground p-8 text-center"
                    >
                      No route assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
