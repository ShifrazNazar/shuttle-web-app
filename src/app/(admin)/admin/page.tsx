"use client";

import { useMemo } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { MapPin, Users, Clock, Activity, Loader2 } from "lucide-react";

import { env } from "~/env";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useShuttles } from "~/hooks/use-shuttles";
import { useActiveDrivers } from "~/hooks/use-active-drivers";

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

  const center = useMemo(() => ({ lat: 3.055465, lng: 101.700363 }), []); // Asia Pacific University of Technology & Innovation
  const activeShuttles = shuttles.filter((s) => s.status === "active");
  const totalPassengers = 234; // Mock data
  const averageWaitTime = 8; // Mock data

  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-sm">Loading map...</p>
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
            <CardTitle className="text-sm font-medium">
              Active Shuttles
            </CardTitle>
            <Activity className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrivers.length}</div>
            <p className="text-muted-foreground text-xs">
              {activeDrivers.length} currently tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Passengers
            </CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPassengers}</div>
            <p className="text-muted-foreground text-xs">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWaitTime}min</div>
            <p className="text-muted-foreground text-xs">
              -2min from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes Active</CardTitle>
            <MapPin className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-muted-foreground text-xs">
              All routes operational
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
              <CardTitle>Shuttle Status</CardTitle>
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
                <p className="text-muted-foreground text-sm">
                  No drivers currently tracking
                </p>
              ) : (
                activeDrivers.map((driver) => (
                  <div
                    key={driver.driverId}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">Bus {driver.busId}</p>
                      <p className="text-muted-foreground text-sm">
                        Driver: {driver.driverEmail || "Unknown"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Last update:{" "}
                        {new Date(driver.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="default">Live Tracking</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-3 py-2 text-sm">
                Emergency Stop All
              </button>
              <button className="hover:bg-muted w-full rounded-md border px-3 py-2 text-sm">
                Broadcast Message
              </button>
              <button className="hover:bg-muted w-full rounded-md border px-3 py-2 text-sm">
                Generate Report
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
