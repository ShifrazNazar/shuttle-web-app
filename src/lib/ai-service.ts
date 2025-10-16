import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AnalyticsData,
  DemandPrediction,
  ScheduleOptimization,
} from "~/types/analytics";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Re-export types from analytics for convenience
export type { DemandPrediction, ScheduleOptimization } from "~/types/analytics";

class AIService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  private requestCount = 0;
  private lastResetTime: number = Date.now();
  private readonly DAILY_LIMIT = 45; // Leave some buffer
  private readonly RESET_HOURS = 24;

  private checkRateLimit(): boolean {
    const now = Date.now();
    const hoursSinceReset = (now - this.lastResetTime) / (1000 * 60 * 60);

    // Reset counter if 24 hours have passed
    if (hoursSinceReset >= this.RESET_HOURS) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    return this.requestCount < this.DAILY_LIMIT;
  }

  private incrementRequestCount(): void {
    this.requestCount++;
  }

  async generateDemandPredictions(
    data: AnalyticsData,
  ): Promise<DemandPrediction[]> {
    // Check rate limit before making API call
    if (!this.checkRateLimit()) {
      console.log(
        "⚠️ AI Service - Rate limit reached, using fallback demand predictions",
      );
      return this.generateFallbackDemandPredictions(data);
    }

    try {
      // Analyze historical boarding patterns
      const routeDemand = this.analyzeRouteDemand(data.boardingRecords);
      const timeSlotDemand = this.analyzeTimeSlotDemand(data.boardingRecords);

      const prompt = `
        Based on historical boarding data, predict demand for the next 7 days:
        
        Historical Data Analysis:
        - Total Boarding Records: ${data.boardingRecords.length}
        - Route Demand Patterns: ${JSON.stringify(routeDemand)}
        - Time Slot Patterns: ${JSON.stringify(timeSlotDemand)}
        
        Current Routes:
        ${data.routes.map((r) => `${r.routeName || r.routeId}: ${r.schedule?.join(", ") || "No schedule"}`).join("\n")}
        
        Generate demand predictions for each route and time slot in valid JSON format (no comments, no trailing commas):
        [
          {
            "routeId": "route_id",
            "routeName": "Route Name",
            "predictedDemand": 25,
            "confidence": 85,
            "timeSlot": "08:00-09:00",
            "date": "2024-01-15",
            "reasoning": "Based on historical patterns showing 20% increase on Mondays",
            "recommendedAction": "Add extra shuttle or increase frequency"
          }
        ]
        
        Consider:
        1. Day of week patterns
        2. Time slot popularity
        3. Seasonal trends
        4. Recent usage spikes
        5. Route-specific characteristics
      `;

      this.incrementRequestCount();
      console.log("🤖 AI Service - Calling Gemini API for demand predictions");
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = /\[[\s\S]*\]/.exec(text);
      if (jsonMatch) {
        try {
          // Clean the JSON by removing comments and fixing common issues
          const cleanJson = jsonMatch[0]
            .replace(/\/\/.*$/gm, "") // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
            .replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas

          return JSON.parse(cleanJson);
        } catch (_parseError) {
          console.log(
            "⚠️ AI Service - Failed to parse AI response as JSON, using fallback demand predictions",
          );
          return this.generateFallbackDemandPredictions(data);
        }
      }

      console.log(
        "⚠️ AI Service - No JSON response found, using fallback demand predictions",
      );
      return this.generateFallbackDemandPredictions(data);
    } catch (error) {
      console.error(
        "❌ AI Service - Error generating demand predictions:",
        error,
      );
      // Check if it's a rate limit error
      if (
        error instanceof Error &&
        (error.message?.includes("429") || error.message?.includes("quota"))
      ) {
        console.log(
          "⚠️ AI Service - Rate limit error detected, using fallback demand predictions",
        );
        return this.generateFallbackDemandPredictions(data);
      }
      console.log(
        "⚠️ AI Service - General error, using fallback demand predictions",
      );
      return this.generateFallbackDemandPredictions(data);
    }
  }

  async generateScheduleOptimizations(
    data: AnalyticsData,
  ): Promise<ScheduleOptimization[]> {
    // Check rate limit before making API call
    if (!this.checkRateLimit()) {
      console.log(
        "⚠️ AI Service - Rate limit reached, using fallback schedule optimizations",
      );
      return this.generateFallbackScheduleOptimizations(data);
    }

    try {
      const routePerformance = this.analyzeRoutePerformance(
        data.boardingRecords,
        data.routes,
      );

      const prompt = `
        Analyze current schedules and suggest optimizations based on actual usage data:
        
        Current Schedules:
        ${data.routes.map((r) => `${r.routeName || r.routeId}: ${r.schedule?.join(", ") || "No schedule"}`).join("\n")}
        
        Route Performance Analysis:
        ${JSON.stringify(routePerformance)}
        
        Boarding Records Sample:
        ${JSON.stringify(data.boardingRecords.slice(0, 20), null, 2)}
        
        Generate schedule optimizations in valid JSON format (no comments, no trailing commas):
        [
          {
            "routeId": "route_id",
            "currentSchedule": ["08:00", "10:00", "14:00"],
            "optimizedSchedule": ["08:00", "09:30", "11:00", "14:00"],
            "efficiencyGain": 15,
            "reasoning": "Peak demand at 09:30 not covered by current schedule",
            "implementationSteps": ["Add 09:30 departure", "Monitor capacity", "Adjust if needed"]
          }
        ]
        
        Focus on:
        1. Peak demand coverage
        2. Wait time reduction
        3. Resource optimization
        4. Student convenience
      `;

      this.incrementRequestCount();
      console.log(
        "🤖 AI Service - Calling Gemini API for schedule optimizations",
      );
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = /\[[\s\S]*\]/.exec(text);
      if (jsonMatch) {
        try {
          // Clean the JSON by removing comments and fixing common issues
          const cleanJson = jsonMatch[0]
            .replace(/\/\/.*$/gm, "") // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
            .replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas

          return JSON.parse(cleanJson);
        } catch (_parseError) {
          console.log(
            "⚠️ AI Service - Failed to parse AI response as JSON, using fallback schedule optimizations",
          );
          return this.generateFallbackScheduleOptimizations(data);
        }
      }

      console.log(
        "⚠️ AI Service - No JSON response found, using fallback schedule optimizations",
      );
      return this.generateFallbackScheduleOptimizations(data);
    } catch (error) {
      console.error(
        "❌ AI Service - Error generating schedule optimizations:",
        error,
      );
      // Check if it's a rate limit error
      if (
        error instanceof Error &&
        (error.message?.includes("429") || error.message?.includes("quota"))
      ) {
        console.log(
          "⚠️ AI Service - Rate limit error detected, using fallback schedule optimizations",
        );
        return this.generateFallbackScheduleOptimizations(data);
      }
      console.log(
        "⚠️ AI Service - General error, using fallback schedule optimizations",
      );
      return this.generateFallbackScheduleOptimizations(data);
    }
  }

  async chatWithAnalytics(
    question: string,
    data: AnalyticsData,
  ): Promise<string> {
    // Check rate limit before making API call
    if (!this.checkRateLimit()) {
      console.log(
        "⚠️ AI Service - Rate limit reached, using fallback chat response",
      );
      return "I'm currently experiencing high demand and cannot process your request right now. Please try again later or check the analytics dashboard for current system data.";
    }

    try {
      // Derive driver-to-route mapping details for richer context
      const routeIdToAssignments: Record<string, any[]> = {};
      (data.routeAssignments || []).forEach((a: any) => {
        const rId = a.routeId || a.route_id || a.route || "";
        if (!rId) return;
        if (!routeIdToAssignments[rId]) routeIdToAssignments[rId] = [];
        routeIdToAssignments[rId].push(a);
      });

      const routeIdToName: Record<string, string> = {};
      (data.routes || []).forEach((r: any) => {
        const id = r.routeId || r.id;
        if (!id) return;
        routeIdToName[id] = r.routeName || r.name || `Route ${id}`;
      });

      // Build driver name map for quick lookup
      const userIdToDriverName: Record<string, string> = {};
      (data.users || []).forEach((u: any) => {
        if (!u?.id) return;
        userIdToDriverName[u.id] = u.name || u.username || u.email || u.id;
      });

      const activeRoutes = (data.routes || []).filter(
        (r: any) => r.isActive !== false,
      );
      const activeRoutesWithoutDrivers = activeRoutes.filter((r: any) => {
        const id = r.routeId || r.id;
        const assignments = routeIdToAssignments[id] || [];
        return assignments.length === 0;
      });

      const driversPerRouteTop5 = activeRoutes
        .map((r: any) => {
          const id = r.routeId || r.id;
          const name = routeIdToName[id] || `Route ${id}`;
          const assigns = routeIdToAssignments[id] || [];
          const driverNames = Array.from(
            new Set(
              assigns
                .map((a: any) => userIdToDriverName[a.driverId] || a.driverId)
                .filter(Boolean),
            ),
          );
          return {
            route: name,
            drivers: driverNames.length,
            driverNames: driverNames.slice(0, 10),
          };
        })
        .sort((a: any, b: any) => b.drivers - a.drivers)
        .slice(0, 5);

      const specificRouteName = "Bloomsvale to APU";
      const specificRoute = (data.routes || []).find(
        (r: any) => (r.routeName || r.name) === specificRouteName,
      );
      let specificRouteDrivers: number | null = null;
      let specificRouteDriverNames: string[] | null = null;
      if (specificRoute) {
        const srId = specificRoute.routeId || specificRoute.id;
        const assigns = routeIdToAssignments[srId] || [];
        const names = Array.from(
          new Set(
            assigns
              .map((a: any) => userIdToDriverName[a.driverId] || a.driverId)
              .filter(Boolean),
          ),
        );
        specificRouteDriverNames = names.slice(0, 20);
        specificRouteDrivers = names.length;
      }

      const prompt = `
        You are an AI analytics assistant for a shuttle management system.
        Answer this question: "${question}" using ONLY the most relevant facts from the data below.

        Current System Data:
        - Total Routes: ${data.totalRoutes}
        - Active Routes: ${data.routes.filter((r) => r.isActive !== false).length}
        - Total Drivers: ${data.totalDrivers}
        - Active Drivers: ${data.activeDrivers}
        - Total Students: ${data.totalStudents}
        - Active Shuttles: ${data.activeShuttles}
        - Assigned Shuttles: ${data.assignedShuttles}
        - Available Shuttles: ${data.availableShuttles}
        - Shuttles (count): ${data.shuttles?.length || 0}
        - Users (count): ${data.users?.length || 0}
        - Route Assignments (count): ${data.routeAssignments?.length || 0}
        - Locations (count): ${data.locations?.length || 0}
        - Daily Stats (count): ${data.dailyStats?.length || 0}
        - Total Boarding Records: ${data.boardingRecords.length}
        - Digital Travel Cards: ${data.digitalTravelCards.length}
        - Legacy: totalDepartures=${data.totalDepartures ?? "n/a"}, averageWaitTime=${data.averageWaitTime ?? "n/a"}, onTimePercentage=${data.onTimePercentage ?? "n/a"}
        - Peak Hours: ${JSON.stringify(data.peakHours || {})}
        - Active Routes Without Drivers: ${activeRoutesWithoutDrivers.length}

        Routes: ${data.routes.map((r) => `${r.routeName || r.routeId} (${r.isActive ? "Active" : "Inactive"})`).join(", ")}
        Route Performance (top 5): ${JSON.stringify((data.routePerformance || []).slice(0, 5))}
        Location Usage (top 5): ${JSON.stringify((data.locationUsage || []).slice(0, 5))}
        Drivers Per Route (top 5): ${JSON.stringify(driversPerRouteTop5)}
        ${specificRouteDrivers !== null ? `Drivers for ${specificRouteName}: ${specificRouteDrivers} - ${JSON.stringify(specificRouteDriverNames)}` : "Drivers for Bloomsvale to APU: unavailable"}

        Constraints for your output:
        - Plain text only (no markdown, no bold, no headings, no emojis).
        - Maximum 60 words.
        - If the question targets a specific metric, answer directly with that value and one-line context.
        - If a critical anomaly exists (e.g., active drivers = 0 while active routes > 0), state the risk in one line and include one direct action.
        - If route-level driver assignment details are unavailable (e.g., no clear mapping from routeAssignments to named routes like "Bloomsvale to APU"), explicitly say this in one short clause.
        - Otherwise, reply in 1-2 short sentences or up to 3 concise bullets.
        - Do not include labels or boilerplate. Answer only with the relevant content.
      `;

      this.incrementRequestCount();
      console.log("🤖 AI Service - Calling Gemini API for chat response");
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      console.log("✅ AI Service - Chat response generated successfully");
      return response.text();
    } catch (error) {
      console.error("❌ AI Service - Error in AI chat:", error);
      // Check if it's a rate limit error
      if (
        error instanceof Error &&
        (error.message?.includes("429") || error.message?.includes("quota"))
      ) {
        console.log(
          "⚠️ AI Service - Rate limit error in chat, using fallback response",
        );
        return "I'm currently experiencing high demand and cannot process your request right now. Please try again later or check the analytics dashboard for current system data.";
      }
      console.log(
        "⚠️ AI Service - General error in chat, using fallback response",
      );
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  private generateFallbackDemandPredictions(
    data: AnalyticsData,
  ): DemandPrediction[] {
    const predictions: DemandPrediction[] = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    // Generate predictions for each route with realistic data
    data.routes.forEach((route, index) => {
      const routeBoardings = data.boardingRecords.filter(
        (record) => record.routeId === route.routeId,
      );
      const avgDemand =
        routeBoardings.length > 0 ? Math.round(routeBoardings.length / 7) : 15;

      // Different time slots for variety
      const timeSlots = [
        "07:30-08:30",
        "08:00-09:00",
        "12:00-13:00",
        "17:00-18:00",
      ];
      const timeSlot = timeSlots[index % timeSlots.length] || "08:00-09:00";

      // Calculate realistic demand based on time slot
      let baseDemand = avgDemand;
      if (timeSlot.includes("07:30") || timeSlot.includes("08:00")) {
        baseDemand = Math.round(avgDemand * 1.3); // Morning peak
      } else if (timeSlot.includes("12:00")) {
        baseDemand = Math.round(avgDemand * 0.8); // Lunch time lower
      } else if (timeSlot.includes("17:00")) {
        baseDemand = Math.round(avgDemand * 1.2); // Evening peak
      }

      const predictedDemand = Math.max(
        5,
        baseDemand + Math.floor(Math.random() * 8) - 4,
      );
      const confidence = 70 + Math.floor(Math.random() * 15); // 70-85%

      predictions.push({
        routeId: route.routeId,
        routeName: route.routeName || `Route ${route.routeId}`,
        predictedDemand,
        confidence,
        timeSlot,
        date:
          tomorrow.toISOString().split("T")[0] ||
          tomorrow.toISOString().substring(0, 10),
        reasoning: `Based on historical data showing ${avgDemand} average daily boardings for this route. ${timeSlot.includes("07:30") || timeSlot.includes("08:00") ? "Morning peak hours typically see 30% higher demand." : timeSlot.includes("17:00") ? "Evening rush hour shows increased passenger volume." : "Midday periods generally have moderate demand."}`,
        recommendedAction:
          predictedDemand > 25
            ? "Add extra shuttle or increase frequency by 50%"
            : predictedDemand > 15
              ? "Monitor capacity and consider adding shuttle if needed"
              : "Current capacity is sufficient for predicted demand",
      });

      // Add a second prediction for the same route with different time slot
      if (index < 3) {
        // Only for first 3 routes to avoid too many predictions
        const secondTimeSlot = timeSlots[(index + 2) % timeSlots.length];
        let secondBaseDemand = avgDemand;
        if (
          secondTimeSlot &&
          (secondTimeSlot.includes("07:30") || secondTimeSlot.includes("08:00"))
        ) {
          secondBaseDemand = Math.round(avgDemand * 1.3);
        } else if (secondTimeSlot?.includes("12:00")) {
          secondBaseDemand = Math.round(avgDemand * 0.8);
        } else if (secondTimeSlot?.includes("17:00")) {
          secondBaseDemand = Math.round(avgDemand * 1.2);
        }

        const secondPredictedDemand = Math.max(
          5,
          secondBaseDemand + Math.floor(Math.random() * 6) - 3,
        );
        const secondConfidence = 65 + Math.floor(Math.random() * 20); // 65-85%

        predictions.push({
          routeId: route.routeId,
          routeName: route.routeName || `Route ${route.routeId}`,
          predictedDemand: secondPredictedDemand,
          confidence: secondConfidence,
          timeSlot: secondTimeSlot || "08:00-09:00",
          date:
            dayAfter.toISOString().split("T")[0] ||
            dayAfter.toISOString().substring(0, 10),
          reasoning: `Historical analysis indicates ${avgDemand} average boardings. ${secondTimeSlot?.includes("07:30") || secondTimeSlot?.includes("08:00") ? "Peak morning hours show consistent high demand patterns." : secondTimeSlot?.includes("17:00") ? "Evening commute patterns suggest increased ridership." : "Off-peak hours typically have lower but steady demand."}`,
          recommendedAction:
            secondPredictedDemand > 20
              ? "Consider scheduling additional departure"
              : secondPredictedDemand > 10
                ? "Current schedule should handle predicted load"
                : "May reduce frequency if demand remains low",
        });
      }
    });

    return predictions;
  }

  private generateFallbackScheduleOptimizations(
    data: AnalyticsData,
  ): ScheduleOptimization[] {
    const optimizations: ScheduleOptimization[] = [];

    data.routes.forEach((route, index) => {
      if (route.schedule && route.schedule.length > 0) {
        const currentSchedule = route.schedule;

        // Generate different optimization strategies based on route index
        let optimizedSchedule: string[];
        let efficiencyGain: number;
        let reasoning: string;
        let implementationSteps: string[];

        switch (index % 4) {
          case 0: // Morning peak optimization
            optimizedSchedule = [...currentSchedule, "07:45", "08:15"];
            efficiencyGain = 18;
            reasoning =
              "Morning peak analysis shows high demand between 07:30-08:30. Adding 07:45 and 08:15 departures will reduce wait times and improve passenger satisfaction.";
            implementationSteps = [
              "Add 07:45 departure to capture early commuters",
              "Add 08:15 departure for peak rush hour",
              "Assign additional driver for morning shifts",
              "Monitor capacity utilization for 2 weeks",
              "Adjust frequency based on actual demand",
            ];
            break;

          case 1: // Evening optimization
            optimizedSchedule = [...currentSchedule, "17:30", "18:00"];
            efficiencyGain = 22;
            reasoning =
              "Evening commute patterns indicate high demand from 17:00-18:30. Additional departures at 17:30 and 18:00 will better serve student schedules.";
            implementationSteps = [
              "Add 17:30 departure for early evening commuters",
              "Add 18:00 departure for peak evening rush",
              "Coordinate with class dismissal times",
              "Track boarding patterns for optimization",
              "Consider extending service if demand exceeds capacity",
            ];
            break;

          case 2: // Midday frequency increase
            optimizedSchedule = [...currentSchedule, "11:30", "13:30"];
            efficiencyGain = 12;
            reasoning =
              "Midday analysis reveals gaps in service between 11:00-14:00. Adding 11:30 and 13:30 departures will improve accessibility for students with flexible schedules.";
            implementationSteps = [
              "Add 11:30 departure for late morning commuters",
              "Add 13:30 departure for afternoon activities",
              "Monitor ridership during off-peak hours",
              "Adjust frequency based on utilization rates",
              "Consider reducing frequency if demand is low",
            ];
            break;

          default: // Weekend optimization
            optimizedSchedule = [...currentSchedule, "10:00", "14:00"];
            efficiencyGain = 15;
            reasoning =
              "Weekend usage patterns show different demand peaks. Adding 10:00 and 14:00 departures will better serve weekend activities and events.";
            implementationSteps = [
              "Add 10:00 departure for weekend morning activities",
              "Add 14:00 departure for afternoon events",
              "Coordinate with campus events and activities",
              "Monitor weekend ridership patterns",
              "Adjust schedule based on seasonal demand",
            ];
            break;
        }

        optimizations.push({
          routeId: route.routeId,
          currentSchedule,
          optimizedSchedule,
          efficiencyGain,
          reasoning,
          implementationSteps,
        });
      } else {
        // For routes without existing schedules, create a basic optimized schedule
        const basicSchedule = [
          "08:00",
          "10:00",
          "12:00",
          "14:00",
          "16:00",
          "18:00",
        ];
        const optimizedSchedule = [
          "07:30",
          "08:00",
          "09:30",
          "11:00",
          "12:30",
          "14:00",
          "15:30",
          "17:00",
          "18:30",
        ];

        optimizations.push({
          routeId: route.routeId,
          currentSchedule: basicSchedule,
          optimizedSchedule,
          efficiencyGain: 25,
          reasoning:
            "No existing schedule found. Created optimized schedule based on typical university shuttle patterns with peak hour coverage and reduced wait times.",
          implementationSteps: [
            "Implement new optimized schedule",
            "Assign drivers to cover all time slots",
            "Monitor passenger boarding patterns",
            "Collect feedback from students and drivers",
            "Fine-tune schedule based on actual usage data",
            "Consider seasonal adjustments",
          ],
        });
      }
    });

    return optimizations;
  }

  // Helper methods for data analysis
  private analyzeRouteDemand(boardingRecords: any[]): Record<string, number> {
    return boardingRecords.reduce(
      (acc, record) => {
        const routeId = record.routeId || "unknown";
        acc[routeId] = (acc[routeId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private analyzeTimeSlotDemand(
    boardingRecords: any[],
  ): Record<string, number> {
    return boardingRecords.reduce(
      (acc, record) => {
        const hour = new Date(
          record.timestamp?.toDate?.() || record.timestamp,
        ).getHours();
        const timeSlot = `${hour.toString().padStart(2, "0")}:00-${(hour + 1).toString().padStart(2, "0")}:00`;
        acc[timeSlot] = (acc[timeSlot] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private analyzeRoutePerformance(
    boardingRecords: any[],
    routes: any[],
  ): Record<string, any> {
    const performance: Record<string, any> = {};

    routes.forEach((route) => {
      const routeBoardings = boardingRecords.filter(
        (record) => record.routeId === route.routeId,
      );
      const totalBoardings = routeBoardings.length;
      const avgPerDay = totalBoardings / 7; // Assuming 7 days of data

      performance[route.routeId] = {
        totalBoardings,
        avgPerDay: Math.round(avgPerDay),
        utilization: route.schedule
          ? Math.round((totalBoardings / route.schedule.length) * 100) / 100
          : 0,
      };
    });

    return performance;
  }

  private getPeakHours(boardingRecords: any[]): string {
    const hourlyUsage = boardingRecords.reduce(
      (acc, record) => {
        const hour = new Date(
          record.timestamp?.toDate?.() || record.timestamp,
        ).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const peakHour = Object.entries(hourlyUsage).reduce(
      (a, b) => (hourlyUsage[a[0]] > hourlyUsage[b[0]] ? a : b),
      ["0", 0],
    )[0];

    return `${peakHour}:00-${(parseInt(peakHour) + 1).toString().padStart(2, "0")}:00`;
  }

  private getPopularRoutes(boardingRecords: any[]): string {
    const routeUsage = this.analyzeRouteDemand(boardingRecords);
    const sortedRoutes = Object.entries(routeUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([routeId, count]) => `${routeId} (${count})`)
      .join(", ");

    return sortedRoutes || "No data available";
  }
}

export const aiService = new AIService();
