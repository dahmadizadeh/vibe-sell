import { NextRequest, NextResponse } from "next/server";
import { analyzeBusinessViability, generateSmartTargeting } from "@/lib/ai-analyze";
import { generateSuggestedQuestions } from "@/lib/ai-conversations";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { description, appName, projectGoal } = (await req.json()) as {
    description: string;
    appName: string;
    projectGoal?: import("@/lib/types").ProjectGoal;
  };

  const results: {
    viabilityAnalysis?: ReturnType<typeof analyzeBusinessViability> extends Promise<infer T> ? T : never;
    smartTargeting?: ReturnType<typeof generateSmartTargeting> extends Promise<infer T> ? T : never;
    suggestedQuestions?: string[];
    _errors?: string[];
  } = {};

  const errors: string[] = [];

  // Run viability analysis, smart targeting, and suggested questions in parallel
  const [viabilityResult, targetingResult, questionsResult] = await Promise.allSettled([
    analyzeBusinessViability(description, appName, projectGoal),
    generateSmartTargeting(description, appName, projectGoal),
    generateSuggestedQuestions(appName, description),
  ]);

  if (viabilityResult.status === "fulfilled") {
    results.viabilityAnalysis = viabilityResult.value;
    console.log("[analyze-viability] Viability score:", viabilityResult.value.overallScore, viabilityResult.value.verdict);
  } else {
    console.error("[analyze-viability] Viability analysis failed:", viabilityResult.reason);
    errors.push(`viability: ${viabilityResult.reason?.message || String(viabilityResult.reason)}`);
  }

  if (targetingResult.status === "fulfilled") {
    results.smartTargeting = targetingResult.value;
    console.log("[analyze-viability] Smart targeting groups:", targetingResult.value.audienceGroups?.length);
  } else {
    console.error("[analyze-viability] Smart targeting failed:", targetingResult.reason);
    errors.push(`targeting: ${targetingResult.reason?.message || String(targetingResult.reason)}`);
  }

  if (questionsResult.status === "fulfilled") {
    results.suggestedQuestions = questionsResult.value;
    console.log("[analyze-viability] Generated", questionsResult.value.length, "suggested questions");
  } else {
    console.error("[analyze-viability] Suggested questions failed:", questionsResult.reason);
    errors.push(`questions: ${questionsResult.reason?.message || String(questionsResult.reason)}`);
  }

  if (errors.length > 0) {
    results._errors = errors;
  }

  return NextResponse.json(results);
}
