import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AnalyticsData {
  totalRoutes: number;
  totalDrivers: number;
  totalStudents: number;
  activeShuttles: number;
  assignedShuttles: number;
  availableShuttles: number;
  activeDrivers: number;
  routes: any[];
  shuttles: any[];
  users: any[];
  routeAssignments: any[];
  dailyStats?: any[];
}

export interface AIInsight {
  type: "success" | "warning" | "info" | "recommendation";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  action?: string;
}

export interface AIPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
}

export interface AIRecommendation {
  category: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  timeline: string;
  steps: string[];
}

class AIService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async analyzeSystemData(data: AnalyticsData): Promise<AIInsight[]> {
    try {
      const prompt = `
        Analyze this shuttle management system data and provide actionable insights:
        
        System Overview:
        - Total Routes: ${data.totalRoutes}
        - Active Routes: ${data.routes.filter((r) => r.isActive !== false).length}
        - Total Drivers: ${data.totalDrivers}
        - Total Students: ${data.totalStudents}
        - Active Shuttles: ${data.activeShuttles}
        - Assigned Shuttles: ${data.assignedShuttles}
        - Available Shuttles: ${data.availableShuttles}
        - Live Tracking Drivers: ${data.activeDrivers}
        
        Routes Data:
        ${JSON.stringify(data.routes.slice(0, 5), null, 2)}
        
        Shuttles Data:
        ${JSON.stringify(data.shuttles.slice(0, 5), null, 2)}
        
        Route Assignments:
        ${JSON.stringify(data.routeAssignments.slice(0, 5), null, 2)}
        
        Please analyze this data and provide 5-7 key insights in JSON format:
        [
          {
            "type": "success|warning|info|recommendation",
            "title": "Brief title",
            "description": "Detailed description of the insight",
            "priority": "high|medium|low",
            "action": "Optional suggested action"
          }
        ]
        
        Focus on:
        1. System efficiency and utilization
        2. Resource allocation issues
        3. Performance bottlenecks
        4. Optimization opportunities
        5. Operational insights
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = /\[[\s\S]*\]/.exec(text);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if JSON parsing fails
      return this.generateFallbackInsights(data);
    } catch (error) {
      console.error("Error analyzing data with AI:", error);
      return this.generateFallbackInsights(data);
    }
  }

  async generatePredictions(data: AnalyticsData): Promise<AIPrediction[]> {
    try {
      const prompt = `
        Based on this shuttle system data, predict future trends and performance:
        
        Current Metrics:
        - Active Drivers: ${data.activeDrivers}
        - Assigned Shuttles: ${data.assignedShuttles}
        - Available Shuttles: ${data.availableShuttles}
        - Total Students: ${data.totalStudents}
        - Active Routes: ${data.routes.filter((r) => r.isActive !== false).length}
        
        Historical Data (if available):
        ${data.dailyStats ? JSON.stringify(data.dailyStats.slice(-7), null, 2) : "No historical data"}
        
        Provide predictions for the next 7 days in JSON format:
        [
          {
            "metric": "Metric name",
            "currentValue": 100,
            "predictedValue": 110,
            "confidence": 85,
            "timeframe": "7 days",
            "reasoning": "Why this prediction was made"
          }
        ]
        
        Predict for:
        1. Daily active drivers
        2. Shuttle utilization rate
        3. Route demand
        4. System efficiency
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = /\[[\s\S]*\]/.exec(text);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.generateFallbackPredictions(data);
    } catch (error) {
      console.error("Error generating predictions:", error);
      return this.generateFallbackPredictions(data);
    }
  }

  async generateRecommendations(
    data: AnalyticsData,
  ): Promise<AIRecommendation[]> {
    try {
      const prompt = `
        Analyze this shuttle management system and provide strategic recommendations:
        
        System Status:
        - Fleet Utilization: ${Math.round((data.assignedShuttles / data.activeShuttles) * 100)}%
        - Driver Coverage: ${Math.round((data.activeDrivers / data.totalDrivers) * 100)}%
        - Route Coverage: ${Math.round((data.routes.filter((r) => r.isActive !== false).length / data.totalRoutes) * 100)}%
        - Student-to-Driver Ratio: ${Math.round(data.totalStudents / data.totalDrivers)}
        
        Current Issues:
        - Available Shuttles: ${data.availableShuttles} (${Math.round((data.availableShuttles / data.activeShuttles) * 100)}% of fleet)
        - Unassigned Drivers: ${data.totalDrivers - data.activeDrivers}
        
        Provide 4-6 strategic recommendations in JSON format:
        [
          {
            "category": "Fleet Management|Route Optimization|Driver Management|Student Experience",
            "title": "Recommendation title",
            "description": "Detailed recommendation",
            "impact": "high|medium|low",
            "effort": "high|medium|low",
            "timeline": "Immediate|1-2 weeks|1 month|Long-term",
            "steps": ["Step 1", "Step 2", "Step 3"]
          }
        ]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = /\[[\s\S]*\]/.exec(text);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.generateFallbackRecommendations(data);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return this.generateFallbackRecommendations(data);
    }
  }

  async chatWithAnalytics(
    question: string,
    data: AnalyticsData,
  ): Promise<string> {
    try {
      const prompt = `
        You are an AI analytics assistant for a shuttle management system. 
        Answer this question: "${question}"
        
        Current System Data:
        - Total Routes: ${data.totalRoutes}
        - Active Routes: ${data.routes.filter((r) => r.isActive !== false).length}
        - Total Drivers: ${data.totalDrivers}
        - Active Drivers: ${data.activeDrivers}
        - Total Students: ${data.totalStudents}
        - Active Shuttles: ${data.activeShuttles}
        - Assigned Shuttles: ${data.assignedShuttles}
        - Available Shuttles: ${data.availableShuttles}
        
        Routes: ${data.routes.map((r) => `${r.routeName} (${r.isActive ? "Active" : "Inactive"})`).join(", ")}
        
        Provide a helpful, data-driven answer based on the current system state.
        Be specific and actionable in your response.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error in AI chat:", error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  private generateFallbackInsights(data: AnalyticsData): AIInsight[] {
    const insights: AIInsight[] = [];

    // Fleet utilization insight
    const utilizationRate = Math.round(
      (data.assignedShuttles / data.activeShuttles) * 100,
    );
    if (utilizationRate < 70) {
      insights.push({
        type: "warning",
        title: "Low Fleet Utilization",
        description: `Only ${utilizationRate}% of your shuttle fleet is currently assigned to drivers. Consider reassigning available shuttles or reducing fleet size.`,
        priority: "medium",
        action: "Review shuttle assignments and consider fleet optimization",
      });
    }

    // Driver coverage insight
    const driverCoverage = Math.round(
      (data.activeDrivers / data.totalDrivers) * 100,
    );
    if (driverCoverage < 50) {
      insights.push({
        type: "warning",
        title: "Low Driver Activity",
        description: `Only ${driverCoverage}% of your drivers are currently active. This may indicate scheduling issues or driver engagement problems.`,
        priority: "high",
        action: "Check driver schedules and engagement",
      });
    }

    // Available shuttles insight
    if (data.availableShuttles > data.assignedShuttles) {
      insights.push({
        type: "info",
        title: "Excess Shuttle Capacity",
        description: `You have ${data.availableShuttles} available shuttles that could be assigned to drivers or used for additional routes.`,
        priority: "low",
        action: "Consider expanding routes or driver assignments",
      });
    }

    return insights;
  }

  private generateFallbackPredictions(data: AnalyticsData): AIPrediction[] {
    return [
      {
        metric: "Active Drivers",
        currentValue: data.activeDrivers,
        predictedValue: Math.max(
          0,
          data.activeDrivers + Math.floor(Math.random() * 3) - 1,
        ),
        confidence: 75,
        timeframe: "7 days",
        reasoning: "Based on current driver activity patterns",
      },
      {
        metric: "Fleet Utilization",
        currentValue: Math.round(
          (data.assignedShuttles / data.activeShuttles) * 100,
        ),
        predictedValue: Math.min(
          100,
          Math.round((data.assignedShuttles / data.activeShuttles) * 100) + 5,
        ),
        confidence: 80,
        timeframe: "7 days",
        reasoning: "Expected improvement with better assignment management",
      },
    ];
  }

  private generateFallbackRecommendations(
    data: AnalyticsData,
  ): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    if (data.availableShuttles > 0) {
      recommendations.push({
        category: "Fleet Management",
        title: "Optimize Shuttle Assignments",
        description: `You have ${data.availableShuttles} unassigned shuttles. Consider assigning them to drivers or using them for additional routes.`,
        impact: "medium",
        effort: "low",
        timeline: "Immediate",
        steps: [
          "Review current driver assignments",
          "Identify drivers without assigned shuttles",
          "Assign available shuttles to drivers",
          "Update route assignments accordingly",
        ],
      });
    }

    if (data.activeDrivers < data.totalDrivers) {
      recommendations.push({
        category: "Driver Management",
        title: "Increase Driver Engagement",
        description: `Only ${data.activeDrivers} out of ${data.totalDrivers} drivers are currently active. Focus on driver engagement and scheduling.`,
        impact: "high",
        effort: "medium",
        timeline: "1-2 weeks",
        steps: [
          "Contact inactive drivers",
          "Review scheduling system",
          "Implement driver incentives",
          "Improve communication channels",
        ],
      });
    }

    return recommendations;
  }
}

export const aiService = new AIService();
