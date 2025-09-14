"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Bus,
  Clock,
  MapPin,
  Activity,
  BarChart3,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  Filter,
} from "lucide-react";

interface AnalyticsData {
  totalRoutes: number;
  totalDrivers: number;
  totalStudents: number;
  activeShuttles: number;
  totalDepartures: number;
  averageWaitTime: number;
  onTimePercentage: number;
  peakHours: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  routePerformance: {
    routeId: string;
    routeName: string;
    usage: number;
    efficiency: number;
    delays: number;
  }[];
  dailyStats: {
    date: string;
    passengers: number;
    departures: number;
    delays: number;
  }[];
  locationUsage: {
    location: string;
    pickups: number;
    dropoffs: number;
    popularity: number;
  }[];
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  // selectedMetric removed - not used in current implementation

  useEffect(() => {
    void fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      // In a real app, you'd fetch this from an API or database
      // For now, we'll simulate comprehensive analytics data
      const mockData: AnalyticsData = {
        totalRoutes: 12,
        totalDrivers: 8,
        totalStudents: 1250,
        activeShuttles: 6,
        totalDepartures: 156,
        averageWaitTime: 8.5,
        onTimePercentage: 92.3,
        peakHours: {
          morning: 45,
          afternoon: 38,
          evening: 42,
        },
        routePerformance: [
          {
            routeId: "R001",
            routeName: "LRT Bukit Jalil ↔ APU",
            usage: 95,
            efficiency: 94,
            delays: 3,
          },
          {
            routeId: "R002",
            routeName: "APU ↔ LRT Bukit Jalil",
            usage: 88,
            efficiency: 91,
            delays: 5,
          },
          {
            routeId: "R003",
            routeName: "M Vertica ↔ APU",
            usage: 72,
            efficiency: 87,
            delays: 8,
          },
          {
            routeId: "R004",
            routeName: "APU ↔ M Vertica",
            usage: 68,
            efficiency: 85,
            delays: 9,
          },
          {
            routeId: "R005",
            routeName: "City of Green ↔ APU",
            usage: 78,
            efficiency: 89,
            delays: 6,
          },
          {
            routeId: "R006",
            routeName: "APU ↔ City of Green",
            usage: 75,
            efficiency: 88,
            delays: 7,
          },
        ],
        dailyStats: [
          { date: "2025-01-10", passengers: 245, departures: 156, delays: 12 },
          { date: "2025-01-11", passengers: 267, departures: 156, delays: 8 },
          { date: "2025-01-12", passengers: 289, departures: 156, delays: 15 },
          { date: "2025-01-13", passengers: 234, departures: 156, delays: 11 },
          { date: "2025-01-14", passengers: 256, departures: 156, delays: 9 },
          { date: "2025-01-15", passengers: 278, departures: 156, delays: 13 },
          { date: "2025-01-16", passengers: 291, departures: 156, delays: 7 },
        ],
        locationUsage: [
          { location: "APU", pickups: 1250, dropoffs: 1250, popularity: 100 },
          {
            location: "LRT Bukit Jalil",
            pickups: 890,
            dropoffs: 890,
            popularity: 85,
          },
          {
            location: "M Vertica",
            pickups: 456,
            dropoffs: 456,
            popularity: 65,
          },
          {
            location: "City of Green",
            pickups: 567,
            dropoffs: 567,
            popularity: 72,
          },
          {
            location: "Fortune Park",
            pickups: 678,
            dropoffs: 678,
            popularity: 78,
          },
          {
            location: "Bloomsvale",
            pickups: 234,
            dropoffs: 234,
            popularity: 45,
          },
          { location: "Mosque", pickups: 89, dropoffs: 89, popularity: 25 },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
      direction: change > 0 ? "up" : "down",
    };
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600";
    if (efficiency >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return { variant: "default", text: "Excellent" };
    if (efficiency >= 80) return { variant: "secondary", text: "Good" };
    return { variant: "destructive", text: "Needs Improvement" };
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
            System Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Comprehensive insights into shuttle system performance and usage
            patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Eye className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analysis Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { value: "1d", label: "24 Hours" },
              { value: "7d", label: "7 Days" },
              { value: "30d", label: "30 Days" },
              { value: "90d", label: "90 Days" },
            ].map((period) => (
              <Button
                key={period.value}
                variant={
                  selectedPeriod === period.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Passengers
            </CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.dailyStats
                .reduce((sum, day) => sum + day.passengers, 0)
                .toLocaleString()}
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On-Time Performance
            </CardTitle>
            <CheckCircle className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.onTimePercentage}%
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +2.1% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Wait Time
            </CardTitle>
            <Clock className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.averageWaitTime} min
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <TrendingDown className="h-3 w-3 text-green-600" />
              -1.2 min from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Efficiency
            </CardTitle>
            <Activity className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                analyticsData.routePerformance.reduce(
                  (sum, route) => sum + route.efficiency,
                  0,
                ) / analyticsData.routePerformance.length,
              )}
              %
            </div>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +3.8% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Peak Hours Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">
                    Morning (07:00-09:00)
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {analyticsData.peakHours.morning}%
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Peak usage
                  </div>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${analyticsData.peakHours.morning}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">
                    Afternoon (16:00-18:00)
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {analyticsData.peakHours.afternoon}%
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Peak usage
                  </div>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${analyticsData.peakHours.afternoon}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">
                    Evening (18:00-20:00)
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {analyticsData.peakHours.evening}%
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Peak usage
                  </div>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{ width: `${analyticsData.peakHours.evening}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Location Popularity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.locationUsage
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 5)
                .map((location, index) => (
                  <div
                    key={location.location}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">
                        {location.location}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {location.popularity}%
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {location.pickups} trips
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-green-600" />
            Route Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium">Route</th>
                  <th className="p-3 text-left font-medium">Usage</th>
                  <th className="p-3 text-left font-medium">Efficiency</th>
                  <th className="p-3 text-left font-medium">Delays</th>
                  <th className="p-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.routePerformance.map((route) => {
                  const efficiencyBadge = getEfficiencyBadge(route.efficiency);
                  return (
                    <tr
                      key={route.routeId}
                      className="hover:bg-muted/50 border-b"
                    >
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{route.routeName}</div>
                          <div className="text-muted-foreground text-sm">
                            {route.routeId}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${route.usage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {route.usage}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${getEfficiencyColor(route.efficiency)}`}
                          >
                            {route.efficiency}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{route.delays}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            efficiencyBadge.variant as
                              | "default"
                              | "secondary"
                              | "destructive"
                          }
                        >
                          {efficiencyBadge.text}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Daily Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-7">
            {analyticsData.dailyStats.map((day, index) => {
              const previousDay = analyticsData.dailyStats[index - 1];
              const passengerChange = previousDay
                ? getMetricChange(day.passengers, previousDay.passengers)
                : null;

              return (
                <div key={day.date} className="space-y-2">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-center">
                      <div className="text-lg font-bold">{day.passengers}</div>
                      <div className="text-muted-foreground text-xs">
                        Passengers
                      </div>
                    </div>

                    {passengerChange && (
                      <div className="flex items-center justify-center gap-1 text-xs">
                        {passengerChange.isPositive ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                        )}
                        <span
                          className={
                            passengerChange.isPositive
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {passengerChange.value}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium">{day.departures}</div>
                    <div className="text-muted-foreground text-xs">
                      Departures
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium text-red-600">
                      {day.delays}
                    </div>
                    <div className="text-muted-foreground text-xs">Delays</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">
                    Peak Performance
                  </div>
                  <div className="text-sm text-green-700">
                    Morning routes show 95% efficiency, indicating optimal
                    scheduling
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">
                    Route Optimization
                  </div>
                  <div className="text-sm text-yellow-700">
                    M Vertica route has 8 delays - consider adding buffer time
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <TrendingUp className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-800">
                    Growing Demand
                  </div>
                  <div className="text-sm text-blue-700">
                    Weekend usage increased 15% - consider additional services
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-2 font-medium">Immediate Actions</div>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Add 5-minute buffer to M Vertica route</li>
                  <li>• Increase frequency during 16:00-18:00 peak</li>
                  <li>• Review driver assignments for high-delay routes</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-2 font-medium">Short-term (1-2 weeks)</div>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Implement real-time delay notifications</li>
                  <li>• Add weekend shuttle services</li>
                  <li>• Optimize route timing based on usage data</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-2 font-medium">Long-term (1-2 months)</div>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• AI-powered demand prediction system</li>
                  <li>• Dynamic route optimization</li>
                  <li>• Passenger satisfaction surveys</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
