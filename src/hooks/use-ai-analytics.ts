import { useState, useCallback } from "react";
import type {
  AnalyticsData,
  AIInsight,
  AIPrediction,
  AIRecommendation,
} from "~/types/analytics";

interface UseAIAnalyticsReturn {
  insights: AIInsight[];
  predictions: AIPrediction[];
  recommendations: AIRecommendation[];
  loading: boolean;
  error: string | null;
  generateInsights: (data: AnalyticsData) => Promise<void>;
  generatePredictions: (data: AnalyticsData) => Promise<void>;
  generateRecommendations: (data: AnalyticsData) => Promise<void>;
  chatWithAI: (question: string, data: AnalyticsData) => Promise<string>;
  clearError: () => void;
}

export const useAIAnalytics = (): UseAIAnalyticsReturn => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeAPICall = async (
    action: string,
    data: AnalyticsData,
    question?: string,
  ) => {
    const response = await fetch("/api/ai/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, data, question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "API call failed");
    }

    return response.json() as Promise<{
      insights: AIInsight[];
      predictions: AIPrediction[];
      recommendations: AIRecommendation[];
      response: string;
    }>;
  };

  const generateInsights = useCallback(async (data: AnalyticsData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await makeAPICall("insights", data);
      setInsights(result.insights);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate insights",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePredictions = useCallback(async (data: AnalyticsData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await makeAPICall("predictions", data);
      setPredictions(result.predictions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate predictions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const generateRecommendations = useCallback(async (data: AnalyticsData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await makeAPICall("recommendations", data);
      setRecommendations(result.recommendations);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate recommendations",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const chatWithAI = useCallback(
    async (question: string, data: AnalyticsData): Promise<string> => {
      try {
        setLoading(true);
        setError(null);
        const result = await makeAPICall("chat", data, question);
        return result.response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to chat with AI";
        setError(errorMessage);
        return errorMessage;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    insights,
    predictions,
    recommendations,
    loading,
    error,
    generateInsights,
    generatePredictions,
    generateRecommendations,
    chatWithAI,
    clearError,
  };
};
