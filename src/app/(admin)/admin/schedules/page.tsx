"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Clock,
  Calendar,
  Users,
  Route,
  Car,
  Bus,
  Search,
  Filter,
  Download,
  Plus,
  MapPin,
  Timer,
  AlertCircle,
  TrendingUp,
  TrendingDown,
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

interface ScheduleTime {
  time: string;
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  assignedDriver?: Driver;
  status: "upcoming" | "active" | "completed" | "delayed";
}

export default function SchedulesPage() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [allSchedules, setAllSchedules] = useState<ScheduleTime[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleTime[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchSchedulesData();
    fetchDrivers();
  }, []);

  useEffect(() => {
    filterSchedules();
  }, [allSchedules, selectedDay, selectedRoute, searchTerm]);

  const fetchSchedulesData = async () => {
    try {
      // In a real app, you'd fetch this from an API or database
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

      setRoutes(routesData);

      // Create comprehensive schedule array
      const schedules: ScheduleTime[] = [];
      routesData.forEach((route) => {
        route.schedule.forEach((time) => {
          schedules.push({
            time,
            routeId: route.routeId,
            routeName: route.routeName,
            origin: route.origin,
            destination: route.destination,
            status: "upcoming",
          });
        });
      });

      // Sort by time
      schedules.sort((a, b) => a.time.localeCompare(b.time));
      setAllSchedules(schedules);
    } catch (error) {
      console.error("Error fetching schedules data:", error);
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

  const filterSchedules = () => {
    let filtered = allSchedules;

    // Filter by day
    if (selectedDay !== "all") {
      const routeIdsForDay = routes
        .filter((route) => route.operatingDays.includes(selectedDay))
        .map((route) => route.routeId);
      filtered = filtered.filter((schedule) =>
        routeIdsForDay.includes(schedule.routeId),
      );
    }

    // Filter by route
    if (selectedRoute !== "all") {
      filtered = filtered.filter(
        (schedule) => schedule.routeId === selectedRoute,
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.destination.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredSchedules(filtered);
  };

  const getAssignedDriver = (routeId: string) => {
    const assignedDrivers = drivers.filter(
      (driver) => driver.assignedShuttleId,
    );
    if (assignedDrivers.length === 0) return null;

    const routeIndex = routes.findIndex((route) => route.routeId === routeId);
    const driverIndex = routeIndex % assignedDrivers.length;
    return assignedDrivers[driverIndex];
  };

  const getScheduleStatus = (time: string) => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    if (time < currentTime) return "completed";
    if (time === currentTime) return "active";
    return "upcoming";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "delayed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "🟢";
      case "completed":
        return "✅";
      case "delayed":
        return "⚠️";
      default:
        return "⏰";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Schedules</h1>
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
            <Clock className="h-6 w-6 text-blue-600" />
            Shuttle Schedules
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View and manage detailed shuttle schedules across all routes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Schedule
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Schedule Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departures
            </CardTitle>
            <Clock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allSchedules.length}</div>
            <p className="text-muted-foreground text-xs">
              Scheduled departures
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-muted-foreground text-xs">Operating routes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Departures
            </CardTitle>
            <Calendar className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                allSchedules.filter((schedule) => {
                  const today = new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                  });
                  const route = routes.find(
                    (r) => r.routeId === schedule.routeId,
                  );
                  return route?.operatingDays.includes(today);
                }).length
              }
            </div>
            <p className="text-muted-foreground text-xs">Departures today</p>
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
              Drivers with assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Schedule Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Day Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Operating Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="all">All Days</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            {/* Route Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Route</label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="all">All Routes</option>
                {routes.map((route) => (
                  <option key={route.routeId} value={route.routeId}>
                    {route.routeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search routes, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-input bg-background w-full rounded-md border py-2 pr-3 pl-10 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detailed Schedule</span>
            <Badge variant="outline">
              {filteredSchedules.length} departures
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Time</th>
                  <th className="p-3 text-left font-medium">Route</th>
                  <th className="p-3 text-left font-medium">
                    Origin → Destination
                  </th>
                  <th className="p-3 text-left font-medium">Driver</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule, index) => {
                  const assignedDriver = getAssignedDriver(schedule.routeId);
                  const status = getScheduleStatus(schedule.time);

                  return (
                    <tr
                      key={`${schedule.routeId}-${schedule.time}-${index}`}
                      className="hover:bg-muted/50 border-b"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="text-muted-foreground h-4 w-4" />
                          <span className="font-mono font-medium">
                            {schedule.time}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium">
                              {schedule.routeName}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {schedule.routeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-muted-foreground h-4 w-4" />
                          <div>
                            <div className="text-sm">{schedule.origin}</div>
                            <div className="text-muted-foreground text-sm">
                              → {schedule.destination}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {assignedDriver ? (
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-green-600" />
                            <div>
                              <div className="text-sm font-medium">
                                {assignedDriver.username}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {assignedDriver.assignedShuttleId}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Car className="text-muted-foreground h-4 w-4" />
                            <span className="text-muted-foreground text-sm">
                              Unassigned
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(status)} border`}
                        >
                          {getStatusIcon(status)} {status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Users className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Timer className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredSchedules.length === 0 && (
            <div className="py-12 text-center">
              <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                No schedules match your filters
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Morning Peak:</span>
                <span className="font-medium">07:30 - 09:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Afternoon Peak:</span>
                <span className="font-medium">16:00 - 18:00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Evening Peak:</span>
                <span className="font-medium">18:00 - 20:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Special Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Friday Prayer:</span>
                <div className="text-muted-foreground">12:30 & 13:30</div>
              </div>
              <div className="text-sm">
                <span className="font-medium">Weekend Service:</span>
                <div className="text-muted-foreground">Reduced frequency</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-600" />
              Low Frequency Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Bloomsvale:</span>
                <div className="text-muted-foreground">2 departures daily</div>
              </div>
              <div className="text-sm">
                <span className="font-medium">M Vertica:</span>
                <div className="text-muted-foreground">4 departures daily</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
