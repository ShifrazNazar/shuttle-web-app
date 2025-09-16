import { type NextRequest, NextResponse } from "next/server";
import { aiService } from "~/lib/ai-service";
import type { AnalyticsData } from "~/types/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, question } = body;

    console.log(`🤖 AI Analytics API called - Action: ${action}`);

    if (!data) {
      console.log("❌ AI Analytics API - Missing analytics data");
      return NextResponse.json(
        { error: "Analytics data is required" },
        { status: 400 },
      );
    }

    const analyticsData: AnalyticsData = data;

    switch (action) {
      case "demand-predictions":
        console.log("📊 Generating demand predictions...");
        const demandPredictions =
          await aiService.generateDemandPredictions(analyticsData);
        console.log(
          `✅ Demand predictions generated: ${demandPredictions.length} predictions`,
        );
        return NextResponse.json({ demandPredictions });

      case "schedule-optimizations":
        console.log("⚡ Generating schedule optimizations...");
        const scheduleOptimizations =
          await aiService.generateScheduleOptimizations(analyticsData);
        console.log(
          `✅ Schedule optimizations generated: ${scheduleOptimizations.length} optimizations`,
        );
        return NextResponse.json({ scheduleOptimizations });

      case "chat":
        if (!question) {
          console.log("❌ AI Chat - Missing question");
          return NextResponse.json(
            { error: "Question is required for chat" },
            { status: 400 },
          );
        }
        console.log(`💬 AI Chat - Question: "${question}"`);
        const chatResponse = await aiService.chatWithAnalytics(
          question as string,
          analyticsData,
        );
        console.log("✅ AI Chat response generated");
        return NextResponse.json({ response: chatResponse });

      default:
        console.log(`❌ Invalid action: ${action}`);
        return NextResponse.json(
          {
            error:
              "Invalid action. Use: demand-predictions, schedule-optimizations, or chat",
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("❌ AI Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI analytics request" },
      { status: 500 },
    );
  }
}
