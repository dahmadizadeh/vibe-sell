import { NextRequest, NextResponse } from "next/server";
import { generateApp, generateTargeting, slugify } from "@/lib/ai";
import { detectBuilderScenario, getBuilderMockData } from "@/lib/mock-data";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { description } = (await req.json()) as { description: string };

  try {
    console.log("[analyze-idea] Starting app generation for:", description.slice(0, 80));

    // Step 1: Generate the actual app
    const app = await generateApp(description);
    console.log("[analyze-idea] App generated:", app.name, "code length:", app.reactCode?.length);

    // Step 2: Generate targeting based on the real app name
    const targeting = await generateTargeting(description, app.name);
    console.log("[analyze-idea] Targeting generated:", targeting.summary?.slice(0, 80));

    return NextResponse.json({
      targeting,
      productPage: {
        name: app.name,
        tagline: app.tagline,
        features: app.features,
        shareUrl: `/p/${slugify(app.name)}`,
        reactCode: app.reactCode,
      },
    });
  } catch (error) {
    console.error("[analyze-idea] AI generation failed:", error);
    // Fall back to mock data
    const scenario = detectBuilderScenario(description);
    const data = getBuilderMockData(scenario);
    return NextResponse.json({
      targeting: data.targeting,
      productPage: data.productPage,
      _fallback: true,
    });
  }
}
