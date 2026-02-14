import { NextRequest, NextResponse } from "next/server";
import { calculatePMFScore } from "@/lib/ai-conversations";
import type { Conversation } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { conversations, appName, description } = (await req.json()) as {
    conversations: Conversation[];
    appName: string;
    description: string;
  };

  try {
    const pmfScore = await calculatePMFScore(conversations, appName, description);
    return NextResponse.json({ pmfScore });
  } catch (err) {
    console.error("[re-evaluate] PMF calculation failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
