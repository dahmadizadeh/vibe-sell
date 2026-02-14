import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { url } = (await req.json()) as { url: string };

  if (!url) {
    return NextResponse.json({ error: true, _error: "URL is required" }, { status: 400 });
  }

  try {
    console.log("[analyze-url] Fetching:", url);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VibeSell/1.0)",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    let html = await response.text();
    // Truncate to 50K chars
    if (html.length > 50000) {
      html = html.slice(0, 50000);
    }

    console.log("[analyze-url] HTML fetched, length:", html.length);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze this web app's HTML and extract structured information about the product.

URL: ${url}

HTML:
${html}

Respond in JSON only, no markdown fences:
{
  "name": "Product name",
  "tagline": "One-line description",
  "description": "2-3 sentence description of what the product does",
  "problemSolved": "The core problem this product solves",
  "targetUser": "Who this product is for (role, industry)",
  "features": ["feature 1", "feature 2", "feature 3"],
  "industry": "Primary industry/vertical",
  "competitors": ["competitor 1", "competitor 2"]
}

If the HTML is minimal or unclear, make reasonable inferences from the URL and any visible content. Always return valid JSON.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const analysis = JSON.parse(text);

    console.log("[analyze-url] Analysis extracted:", analysis.name);

    return NextResponse.json({ analysis, url });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[analyze-url] Failed:", err.message);

    return NextResponse.json(
      { error: true, _error: err.message },
      { status: 500 }
    );
  }
}
