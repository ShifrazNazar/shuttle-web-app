import { type NextRequest, NextResponse } from "next/server";
import { aiService, type AnalyticsData } from "~/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, question } = body;

    if (!data) {
      return NextResponse.json(
        { error: "Analytics data is required" },
        { status: 400 },
      );
    }

    const analyticsData: AnalyticsData = data;

    switch (action) {
      case "insights":
        const insights = await aiService.analyzeSystemData(analyticsData);
        return NextResponse.json({ insights });

      case "predictions":
        const predictions = await aiService.generatePredictions(analyticsData);
        return NextResponse.json({ predictions });

      case "recommendations":
        const recommendations =
          await aiService.generateRecommendations(analyticsData);
        return NextResponse.json({ recommendations });

      case "demand-predictions":
        const demandPredictions =
          await aiService.generateDemandPredictions(analyticsData);
        return NextResponse.json({ demandPredictions });

      case "schedule-optimizations":
        const scheduleOptimizations =
          await aiService.generateScheduleOptimizations(analyticsData);
        return NextResponse.json({ scheduleOptimizations });

      case "chat":
        if (!question) {
          return NextResponse.json(
            { error: "Question is required for chat" },
            { status: 400 },
          );
        }
        const chatResponse = await aiService.chatWithAnalytics(
          question as string,
          analyticsData,
        );
        return NextResponse.json({ response: chatResponse });

      default:
        return NextResponse.json(
          {
            error:
              "Invalid action. Use: insights, predictions, recommendations, demand-predictions, schedule-optimizations, or chat",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("AI Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI analytics request" },
      { status: 500 },
    );
  }
}
