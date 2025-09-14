"use client";

import { useMemo, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { onValue, ref } from "firebase/database";
import { MapPin, Users, Clock, Activity } from "lucide-react";

import { env } from "~/env";
import { rtdb } from "~/lib/firebaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Shuttle, FirebaseDriverData } from "~/types";

export default function AdminDashboardPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);

  useMemo(() => {
    const unsub = onValue(ref(rtdb, "/activeDrivers"), (snap) => {
      const val = snap.val() as Record<string, FirebaseDriverData> | null;
      const list: Shuttle[] = val
        ? Object.entries(val).map(([driverId, v]) => ({
            id: v.busId ?? driverId,
            lat: v.latitude,
            lng: v.longitude,
            heading: v.heading,
            updatedAt: v.timestamp,
            driverId: driverId,
            driverEmail: v.driverEmail,
            isActive: v.isActive,
          }))
        : [];
      setShuttles(list);
    });
    return () => unsub();
  }, []);

  const center = useMemo(() => ({ lat: 3.055465, lng: 101.700363 }), []); // Asia Pacific University of Technology & Innovation
  const activeShuttles = shuttles.filter((s) => s.isActive);
  const totalPassengers = 234; // Mock data
  const averageWaitTime = 8; // Mock data

  if (!isLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground mt-2 text-sm">Loading map...</p>
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
            <div className="text-2xl font-bold">{shuttles.length}</div>
            <p className="text-muted-foreground text-xs">
              {activeShuttles.length} currently moving
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
                {shuttles.map((s) => (
                  <Marker
                    key={s.id}
                    position={{ lat: s.lat, lng: s.lng }}
                    title={`${s.driverEmail} - ${s.isActive ? "Active" : "Inactive"}`}
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
              {shuttles.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No shuttles currently active
                </p>
              ) : (
                shuttles.map((shuttle) => (
                  <div
                    key={shuttle.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">Shuttle {shuttle.id}</p>
                      <p className="text-muted-foreground text-sm">
                        Driver: {shuttle.driverEmail}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {shuttle.isActive ? "Active" : "Inactive"} •{" "}
                        {shuttle.updatedAt
                          ? new Date(shuttle.updatedAt).toLocaleTimeString()
                          : "N/A"}
                      </p>
                    </div>
                    <Badge variant={shuttle.isActive ? "default" : "secondary"}>
                      {shuttle.isActive ? "Active" : "Inactive"}
                    </Badge>
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
