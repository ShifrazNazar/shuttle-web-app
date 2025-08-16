"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import { Button } from "~/components/ui/button";
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

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);

  useEffect(() => {
    fetchRoutesData();
    fetchDrivers();
  }, []);

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

  const getAssignedDriver = (routeId: string) => {
    // In a real app, you'd have a separate collection for route assignments
    // For now, we'll simulate some assignments
    const assignedDrivers = drivers.filter(
      (driver) => driver.assignedShuttleId,
    );
    if (assignedDrivers.length === 0) return null;

    // Simple assignment logic - assign drivers to routes based on index
    const routeIndex = routes.findIndex((route) => route.routeId === routeId);
    const driverIndex = routeIndex % assignedDrivers.length;
    return assignedDrivers[driverIndex];
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

  if (loading) {
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
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Navigation className="mr-2 h-4 w-4" />
            Export Routes
          </Button>
          <Button>
            <Route className="mr-2 h-4 w-4" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Route Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
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
              Assigned Drivers
            </CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.filter((d) => d.assignedShuttleId).length}
            </div>
            <p className="text-muted-foreground text-xs">
              Drivers with bus assignments
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
          const assignedDriver = getAssignedDriver(route.routeId);
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
                    {assignedDriver ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          Assigned
                        </Badge>
                        <span className="text-sm">
                          {assignedDriver.username} (
                          {assignedDriver.assignedShuttleId})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Unassigned
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          No driver assigned
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Notes */}
                {route.specialNotes && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-800">
                      {route.specialNotes}
                    </span>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Map
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="mr-2 h-4 w-4" />
                    Assign Driver
                  </Button>
                  <Button variant="outline" size="sm">
                    <Timer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
