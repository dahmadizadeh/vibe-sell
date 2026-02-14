import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { SEOAudit } from "@/lib/types";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { url, appName, description } = (await req.json()) as {
    url: string;
    appName: string;
    description: string;
  };

  try {
    // Fetch the page HTML for analysis
    let pageContent = "";
    try {
      const pageRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; VibeAndSell/1.0)" },
        signal: AbortSignal.timeout(10000),
      });
      const html = await pageRes.text();
      // Extract key SEO elements from HTML
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
      const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i);
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i);
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i);
      const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["'](.*?)["']/i);
      const schemaMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi) || [];
      const imgWithoutAlt = (html.match(/<img(?![^>]*alt=["'][^"']+["'])[^>]*>/gi) || []).length;
      const totalImages = (html.match(/<img[^>]*>/gi) || []).length;

      pageContent = JSON.stringify({
        title: titleMatch?.[1] || null,
        metaDescription: metaDescMatch?.[1] || null,
        h1Count: h1Matches.length,
        h1s: h1Matches.slice(0, 3).map(h => h.replace(/<[^>]*>/g, "")),
        canonical: canonicalMatch?.[1] || null,
        ogTitle: ogTitleMatch?.[1] || null,
        ogDescription: ogDescMatch?.[1] || null,
        robots: robotsMatch?.[1] || null,
        schemaCount: schemaMatches.length,
        imagesWithoutAlt: imgWithoutAlt,
        totalImages,
        htmlLength: html.length,
        hasViewport: /name=["']viewport["']/i.test(html),
        hasHttps: url.startsWith("https"),
      });
    } catch {
      pageContent = "Could not fetch page - analyze based on URL and description only.";
    }

    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are an SEO and AEO (Answer Engine Optimization) expert. Audit this website for "${appName}": "${description}"

URL: ${url}
Page data: ${pageContent}

Perform both traditional SEO and AEO (optimizing for AI search engines like ChatGPT, Perplexity, Google AI Overviews) checks.

Return ONLY a JSON object with:
{
  "score": 0-100,
  "checks": [
    { "category": "seo" or "aeo", "item": "Check name", "status": "pass" or "fail" or "warning", "detail": "Explanation" }
  ],
  "recommendations": ["Top 3-5 actionable recommendations"],
  "toolSuggestions": ["Specific tools or services that would help"]
}

SEO checks should include: title tag, meta description, H1 tags, canonical URL, Open Graph tags, mobile viewport, HTTPS, image alt text, schema markup.
AEO checks should include: structured data for AI, FAQ schema, clear entity definitions, concise answer-ready content, citation-friendly format, topical authority signals.

No markdown fences. No explanation. Just the JSON object.`,
        },
      ],
    });

    const text = res.content[0].type === "text" ? res.content[0].text : "{}";
    const audit: SEOAudit = JSON.parse(
      text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    );

    return NextResponse.json({ audit });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[seo-audit] Error:", err.message);
    return NextResponse.json({ audit: null, _error: err.message }, { status: 200 });
  }
}
