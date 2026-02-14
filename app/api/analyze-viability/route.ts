import { NextRequest, NextResponse } from "next/server";
import { analyzeBusinessViability, generateSmartTargeting } from "@/lib/ai-analyze";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { description, appName } = (await req.json()) as {
    description: string;
    appName: string;
  };

  const results: {
    viabilityAnalysis?: ReturnType<typeof analyzeBusinessViability> extends Promise<infer T> ? T : never;
    smartTargeting?: ReturnType<typeof generateSmartTargeting> extends Promise<infer T> ? T : never;
    _errors?: string[];
  } = {};

  const errors: string[] = [];

  // Run viability analysis and smart targeting in parallel
  const [viabilityResult, targetingResult] = await Promise.allSettled([
    analyzeBusinessViability(description, appName),
    generateSmartTargeting(description, appName),
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

  if (errors.length > 0) {
    results._errors = errors;
  }

  return NextResponse.json(results);
}
