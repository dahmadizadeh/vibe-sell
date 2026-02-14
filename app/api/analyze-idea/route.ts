import { NextRequest, NextResponse } from "next/server";
import { generateApp, generateTargeting, slugify } from "@/lib/ai";

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
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("ANALYZE-IDEA FAILED:", err.message);
    console.error("ANALYZE-IDEA STACK:", err.stack);
    console.error("ANTHROPIC_API_KEY set?", !!process.env.ANTHROPIC_API_KEY);
    console.error("ANTHROPIC_API_KEY length:", process.env.ANTHROPIC_API_KEY?.length ?? 0);

    return NextResponse.json({
      error: true,
      _error: err.message,
      _apiKeySet: !!process.env.ANTHROPIC_API_KEY,
    }, { status: 500 });
  }
}
