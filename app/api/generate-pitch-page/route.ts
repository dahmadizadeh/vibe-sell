import { NextRequest, NextResponse } from "next/server";
import { searchCompany } from "@/lib/crustdata";
import Anthropic from "@anthropic-ai/sdk";
import type { PitchPage } from "@/lib/types";
import { generateSlug } from "@/lib/utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { description, company } = (await req.json()) as { description: string; company: string };

  try {
    // Enrich with real company data if available
    let companyContext = "";
    try {
      const companyData = await searchCompany(company);
      if (companyData) {
        const parts: string[] = [];
        if (companyData.total_headcount) parts.push(`${companyData.total_headcount} employees`);
        if (companyData.total_funding) parts.push(`$${Math.round(companyData.total_funding / 1_000_000)}M raised`);
        if (companyData.job_openings_count) parts.push(`${companyData.job_openings_count} open roles`);
        if (companyData.headcount_growth_qoq && companyData.headcount_growth_qoq > 0) {
          parts.push(`${Math.round(companyData.headcount_growth_qoq * 100)}% headcount growth QoQ`);
        }
        if (companyData.company_industries?.length) parts.push(`Industry: ${companyData.company_industries.join(", ")}`);
        if (parts.length > 0) companyContext = `\n\nReal company data for ${company}: ${parts.join(". ")}.`;
      }
    } catch (err) {
      console.error("[generate-pitch-page] Company lookup failed (non-fatal):", err);
    }

    const aiRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Generate a pitch page for selling "${description}" to ${company}.${companyContext}

Return ONLY valid JSON with this structure:
{
  "headline": "A compelling headline for ${company}",
  "subtitle": "1-2 sentence value proposition specific to ${company}",
  "problemPoints": ["3 specific problems ${company} likely faces that this product solves"],
  "urgencySignals": ["3 real, specific urgency signals for ${company} (use company data if available)"],
  "ctaText": "Book a Demo"
}

No markdown fences. No explanation. Just the JSON.`,
        },
      ],
    });

    const aiText = aiRes.content[0].type === "text" ? aiRes.content[0].text : "{}";
    const parsed = JSON.parse(aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());

    const pitchPage: PitchPage = {
      targetCompany: company,
      headline: parsed.headline || `Why ${company} Needs This`,
      subtitle: parsed.subtitle || description,
      problemPoints: parsed.problemPoints || [description],
      solutionMockups: [],
      urgencySignals: parsed.urgencySignals || [],
      ctaText: parsed.ctaText || "Book a Demo",
      shareUrl: `/d/${generateSlug(company)}`,
    };

    return NextResponse.json({ pitchPage });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[generate-pitch-page] Error:", err.message);

    // Return a minimal pitch page instead of failing
    const pitchPage: PitchPage = {
      targetCompany: company,
      headline: `Built for ${company}`,
      subtitle: description,
      problemPoints: [],
      solutionMockups: [],
      urgencySignals: [],
      ctaText: "Book a Demo",
      shareUrl: `/d/${generateSlug(company)}`,
    };
    return NextResponse.json({ pitchPage, _error: err.message });
  }
}
