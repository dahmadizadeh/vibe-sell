import { NextRequest, NextResponse } from "next/server";
import { searchPeople, mapPersonToContact } from "@/lib/crustdata";
import type { Contact } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { description, appName, industry } = (await req.json()) as {
    description: string;
    appName: string;
    industry: string;
  };

  try {
    // Use Claude to generate investor-relevant search parameters
    const aiRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are a startup fundraising advisor. A founder built "${appName}" in the "${industry}" space: "${description}".

Generate search filters to find VCs, angels, and fund partners who invest in this space. Return ONLY valid JSON:
{
  "industries": ["Venture Capital & Private Equity", "${industry}"],
  "regions": ["United States"]
}

Keep industries to 2-3 items. No markdown fences. No explanation. Just the JSON.`,
        },
      ],
    });

    const aiText = aiRes.content[0].type === "text" ? aiRes.content[0].text : "{}";
    const cleaned = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const filters = JSON.parse(cleaned) as {
      industries: string[];
      regions: string[];
    };

    // Build Crustdata conditions for investor search
    const conditions: Array<
      | { column: string; type: string; value: string | string[] | number }
      | { op: string; conditions: Array<{ column: string; type: string; value: string | string[] | number }> }
    > = [];

    // Investor titles
    conditions.push({
      op: "or",
      conditions: [
        { column: "current_employers.title", type: "(.)", value: "Venture Capital" },
        { column: "current_employers.title", type: "(.)", value: "Angel Investor" },
        { column: "current_employers.title", type: "(.)", value: "Partner" },
        { column: "current_employers.title", type: "(.)", value: "Managing Director" },
        { column: "current_employers.title", type: "(.)", value: "Principal" },
      ],
    });

    // Industries
    if (filters.industries && filters.industries.length > 0) {
      conditions.push({
        column: "current_employers.company_industries",
        type: "in",
        value: filters.industries,
      });
    }

    // Seniority
    conditions.push({
      column: "current_employers.seniority_level",
      type: "in",
      value: ["CXO", "Vice President", "Director", "Partner"],
    });

    // Regions
    if (filters.regions && filters.regions.length > 0) {
      if (filters.regions.length === 1) {
        conditions.push({ column: "region", type: "(.)", value: filters.regions[0] });
      } else {
        conditions.push({
          op: "or",
          conditions: filters.regions.map((r) => ({
            column: "region", type: "(.)" as const, value: r,
          })),
        });
      }
    }

    console.log("[find-investors] Searching with conditions:", JSON.stringify(conditions, null, 2));

    const people = await searchPeople(conditions, 50);
    console.log("[find-investors] Found", people.length, "investor profiles");

    const contacts = people
      .map((p, i) => mapPersonToContact(p, i))
      .filter((c): c is Contact => c !== null)
      .map((c) => ({
        ...c,
        roleTag: "decision_maker" as const,
        matchReason: `${c.title} at ${c.company} — invests in ${industry}`,
      }));

    return NextResponse.json({ contacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-investors] Error:", err.message);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
