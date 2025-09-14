"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import type { AnalyticsData } from "~/types";
import { useAIAnalytics } from "~/hooks/use-ai-analytics";
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import {
  Users,
  Bus,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  Bot,
  MessageCircle,
  Sparkles,
  Lightbulb,
  TrendingUp as PredictionIcon,
  Route,
} from "lucide-react";

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);

  // AI Analytics hook
  const {
    insights,
    predictions,
    recommendations,
    loading: aiLoading,
    error: aiError,
    generateInsights,
    generatePredictions,
    generateRecommendations,
    chatWithAI,
    clearError,
  } = useAIAnalytics();

  useEffect(() => {
    void fetchAnalyticsData();
  }, []);

  // Generate AI insights when data is loaded
  useEffect(() => {
    if (analyticsData) {
      void generateInsights(analyticsData);
      void generatePredictions(analyticsData);
      void generateRecommendations(analyticsData);
    }
  }, [
    analyticsData,
    generateInsights,
    generatePredictions,
    generateRecommendations,
  ]);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch real data from Firestore
      const [
        routesSnapshot,
        usersSnapshot,
        shuttlesSnapshot,
        assignmentsSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "routes")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "shuttles")),
        getDocs(collection(db, "routeAssignments")),
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

      const analyticsData: AnalyticsData = {
        totalRoutes: routes.length,
        totalDrivers: users.filter((u) => u.role === "driver").length,
        totalStudents: users.filter((u) => u.role === "student").length,
        activeShuttles: shuttles.filter((s) => s.status === "active").length,
        assignedShuttles: shuttles.filter((s) => s.driverId).length,
        availableShuttles: shuttles.filter(
          (s) => s.status === "active" && !s.driverId,
        ).length,
        activeDrivers: 0, // This would come from real-time data
        routes,
        shuttles,
        users,
        routeAssignments,
      };

      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIChat = async () => {
    if (!aiQuestion.trim() || !analyticsData) return;

    const response = await chatWithAI(aiQuestion, analyticsData);
    setAiResponse(response);
    setAiQuestion("");
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Activity className="h-5 w-5 text-blue-600" />;
      case "recommendation":
        return <Lightbulb className="h-5 w-5 text-purple-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      case "recommendation":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
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
            System Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Comprehensive insights into shuttle system performance and usage
            patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIChat(!showAIChat)}>
            <Bot className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
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

      {/* AI Chat Interface */}
      {showAIChat && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              AI Analytics Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your shuttle system analytics..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAIChat()}
                disabled={aiLoading}
              />
              <Button
                onClick={handleAIChat}
                disabled={aiLoading || !aiQuestion.trim()}
              >
                {aiLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
              </Button>
            </div>
            {aiResponse && (
              <div className="rounded-lg border bg-blue-50 p-4">
                <div className="flex items-start gap-2">
                  <Bot className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">{aiResponse}</p>
                  </div>
                </div>
              </div>
            )}
            {aiError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-800">{aiError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearError}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-medium">{insight.title}</h4>
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
                    <p className="mb-2 text-sm text-gray-700">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <p className="text-xs text-gray-600">
                        <strong>Action:</strong> {insight.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Predictions */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PredictionIcon className="h-5 w-5 text-green-600" />
              AI Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {predictions.map((prediction, index) => (
                <div key={index} className="rounded-lg border bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium">{prediction.metric}</h4>
                    <Badge variant="outline" className="text-xs">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">
                        {prediction.currentValue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Predicted:</span>
                      <span className="font-medium text-green-600">
                        {prediction.predictedValue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Timeframe:</span>
                      <span className="text-xs text-gray-500">
                        {prediction.timeframe}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {prediction.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="rounded-lg border bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-0.5 h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {recommendation.category}
                      </Badge>
                    </div>
                    <p className="mb-3 text-sm text-gray-700">
                      {recommendation.description}
                    </p>
                    <div className="mb-3 flex items-center gap-4 text-xs text-gray-600">
                      <span>
                        Impact: <strong>{recommendation.impact}</strong>
                      </span>
                      <span>
                        Effort: <strong>{recommendation.effort}</strong>
                      </span>
                      <span>
                        Timeline: <strong>{recommendation.timeline}</strong>
                      </span>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium text-gray-700">
                        Steps:
                      </p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {recommendation.steps.map((step, stepIndex) => (
                          <li
                            key={stepIndex}
                            className="flex items-start gap-1"
                          >
                            <span className="text-yellow-600">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Real System Metrics */}
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
              Active Drivers
            </CardTitle>
            <Activity className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.activeDrivers}
            </div>
            <p className="text-muted-foreground text-xs">
              Currently tracking location
            </p>
          </CardContent>
        </Card>
      </div>

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
                        {route.name || `Route ${route.id}`}
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
                analyticsData.shuttles.slice(0, 5).map((shuttle, index) => (
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
                        {shuttle.capacity || 0} seats
                      </div>
                    </div>
                  </div>
                ))
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
                    const shuttle = analyticsData.shuttles.find(
                      (s) => s.id === assignment.shuttleId,
                    );

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
                              {route?.name || `Route ${assignment.routeId}`}
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
