import { NextRequest, NextResponse } from "next/server";
import { generateLandingPage } from "@/lib/v0";
import type { LandingPageContext } from "@/lib/v0";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { description, appName, context } = (await req.json()) as {
    description: string;
    appName?: string;
    context?: Partial<LandingPageContext>;
  };

  console.log("[generate-landing] Starting for:", (appName || description).slice(0, 80));

  try {
    const fullContext: LandingPageContext = {
      description,
      appName,
      ...context,
    };

    const result = await generateLandingPage(fullContext);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[generate-landing] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
