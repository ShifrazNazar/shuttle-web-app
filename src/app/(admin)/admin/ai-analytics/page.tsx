"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import type { AnalyticsData } from "~/types/analytics";
import { useAIAnalytics } from "~/hooks/use-ai-analytics";
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/lib/firebaseClient";
import {
  Users,
  Bus,
  Activity,
  AlertCircle,
  Bot,
  MessageCircle,
  Target,
  Zap,
  Brain,
  MapPin,
} from "lucide-react";

export default function AIAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);
  const [demandPredictions, setDemandPredictions] = useState<any[]>([]);
  const [scheduleOptimizations, setScheduleOptimizations] = useState<any[]>([]);
  const [loadingDemand, setLoadingDemand] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // AI Analytics hook
  const {
    loading: aiLoading,
    error: aiError,
    chatWithAI,
    clearError,
  } = useAIAnalytics();

  useEffect(() => {
    void fetchAnalyticsData();
  }, []);

  // No automatic AI generation - user triggered only

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

  const handleAIChat = async () => {
    if (!aiQuestion.trim() || !analyticsData) return;

    const response = await chatWithAI(aiQuestion, analyticsData);
    setAiResponse(response);
    setAiQuestion("");
  };

  const generateDemandPredictions = async () => {
    if (!analyticsData) return;

    setLoadingDemand(true);
    try {
      const response = await fetch("/api/ai/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "demand-predictions",
          data: analyticsData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setDemandPredictions(result.demandPredictions || []);
      }
    } catch (error) {
      console.error("Error generating demand predictions:", error);
    } finally {
      setLoadingDemand(false);
    }
  };

  const generateScheduleOptimizations = async () => {
    if (!analyticsData) return;

    setLoadingSchedule(true);
    try {
      const response = await fetch("/api/ai/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "schedule-optimizations",
          data: analyticsData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setScheduleOptimizations(result.scheduleOptimizations || []);
      }
    } catch (error) {
      console.error("Error generating schedule optimizations:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const generateAllInsights = async () => {
    if (!analyticsData) return;

    // Generate core AI features in parallel
    await Promise.all([
      generateDemandPredictions(),
      generateScheduleOptimizations(),
    ]);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">AI-Powered Analytics</h1>
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">AI-Powered Analytics</h1>
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
            <Brain className="h-6 w-6 text-purple-600" />
            AI-Powered Analytics & Intelligence
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Advanced AI-driven insights, demand forecasting, and intelligent
            optimization recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIChat(!showAIChat)}>
            <Bot className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
          <Button
            variant="outline"
            onClick={generateDemandPredictions}
            disabled={loadingDemand}
          >
            <Target className="mr-2 h-4 w-4" />
            {loadingDemand ? "Generating..." : "Demand Forecast"}
          </Button>
          <Button
            variant="outline"
            onClick={generateScheduleOptimizations}
            disabled={loadingSchedule}
          >
            <Zap className="mr-2 h-4 w-4" />
            {loadingSchedule ? "Optimizing..." : "Smart Optimization"}
          </Button>
          <Button
            onClick={generateAllInsights}
            disabled={aiLoading || loadingDemand || loadingSchedule}
          >
            <Brain className="mr-2 h-4 w-4" />
            Generate All Insights
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

      {/* Rate Limit Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                AI Service Notice
              </p>
              <p className="text-xs text-orange-700">
                Free tier allows 50 requests per day. If you hit the limit,
                fallback data will be shown.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Intelligence Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-purple-50 p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Demand Forecasting</span>
              </div>
              <p className="mt-1 text-sm text-purple-700">
                AI predicts passenger demand patterns and peak hours using
                historical boarding data
              </p>
            </div>
            <div className="rounded-lg border bg-green-50 p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="font-medium">Schedule Optimization</span>
              </div>
              <p className="mt-1 text-sm text-green-700">
                Intelligent route and schedule recommendations with efficiency
                gains up to 15%
              </p>
            </div>
            <div className="rounded-lg border bg-orange-50 p-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-orange-600" />
                <span className="font-medium">AI Assistant</span>
              </div>
              <p className="mt-1 text-sm text-orange-700">
                Interactive AI chat for system queries and data analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced System Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Boardings
            </CardTitle>
            <Activity className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.boardingRecords.length}
            </div>
            <p className="text-muted-foreground text-xs">
              All-time boarding records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digital Cards</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.digitalTravelCards.length}
            </div>
            <p className="text-muted-foreground text-xs">
              {
                analyticsData.digitalTravelCards.filter(
                  (card: any) => card.isActive,
                ).length
              }{" "}
              active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.locations.length}
            </div>
            <p className="text-muted-foreground text-xs">
              Pickup and drop-off points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fleet Utilization
            </CardTitle>
            <Bus className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (analyticsData.assignedShuttles /
                  analyticsData.activeShuttles) *
                  100,
              )}
              %
            </div>
            <p className="text-muted-foreground text-xs">
              {analyticsData.assignedShuttles}/{analyticsData.activeShuttles}{" "}
              shuttles assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demand Predictions */}
      {demandPredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              AI Demand Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {demandPredictions.map((prediction, index) => (
                <div key={index} className="rounded-lg border bg-orange-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium">{prediction.routeName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Predicted Demand:</span>
                      <span className="font-medium text-orange-600">
                        {prediction.predictedDemand} passengers
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Time Slot:</span>
                      <span className="text-xs text-gray-500">
                        {prediction.timeSlot}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-xs text-gray-500">
                        {prediction.date}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {prediction.reasoning}
                    </p>
                    <div className="mt-2 rounded bg-orange-100 p-2">
                      <p className="text-xs font-medium text-orange-800">
                        💡 {prediction.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Optimizations */}
      {scheduleOptimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              AI Schedule Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduleOptimizations.map((optimization, index) => (
              <div key={index} className="rounded-lg border bg-green-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">Route: {optimization.routeId}</h4>
                  <Badge variant="outline" className="text-xs">
                    +{optimization.efficiencyGain}% efficiency
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Current Schedule:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {optimization.currentSchedule.map(
                        (time: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {time}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Optimized Schedule:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {optimization.optimizedSchedule.map(
                        (time: string, idx: number) => (
                          <Badge
                            key={idx}
                            variant="default"
                            className="text-xs"
                          >
                            {time}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="mb-2 text-sm text-gray-600">
                    <strong>Reasoning:</strong> {optimization.reasoning}
                  </p>
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      Implementation Steps:
                    </p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {optimization.implementationSteps.map(
                        (step: string, stepIndex: number) => (
                          <li
                            key={stepIndex}
                            className="flex items-start gap-1"
                          >
                            <span className="text-green-600">•</span>
                            <span>{step}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
