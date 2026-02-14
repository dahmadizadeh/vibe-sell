import { NextRequest, NextResponse } from "next/server";
import { analyzeConversation, calculatePMFScore } from "@/lib/ai-conversations";
import type { Conversation, ConversationAnalysis, PMFScore } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { transcript, appName, description, existingConversations } =
    (await req.json()) as {
      transcript: string;
      appName: string;
      description: string;
      existingConversations?: Conversation[];
    };

  const result: {
    analysis?: ConversationAnalysis;
    pmfScore?: PMFScore;
    _errors?: string[];
  } = {};
  const errors: string[] = [];

  // Analyze the new conversation
  try {
    result.analysis = await analyzeConversation(transcript, appName, description);
  } catch (err) {
    console.error("[analyze-conversation] Analysis failed:", err);
    errors.push(`analysis: ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.json({ _errors: errors }, { status: 500 });
  }

  // If total conversations >= 3, also calculate PMF score
  const totalCount = (existingConversations?.length || 0) + 1;
  if (totalCount >= 3 && result.analysis) {
    try {
      // Build a minimal conversation object for the new one
      const newConvo: Conversation = {
        id: "temp",
        projectId: "temp",
        date: new Date().toISOString(),
        source: "notes",
        transcript,
        analysis: result.analysis,
      };
      const allConversations = [...(existingConversations || []), newConvo];
      result.pmfScore = await calculatePMFScore(allConversations, appName, description);
    } catch (err) {
      console.error("[analyze-conversation] PMF calculation failed:", err);
      errors.push(`pmf: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (errors.length > 0) {
    result._errors = errors;
  }

  return NextResponse.json(result);
}
