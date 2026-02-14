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
    // Use Claude to generate teammate-relevant search parameters
    const aiRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `You are a startup hiring advisor. A founder is building "${appName}" in "${industry}": "${description}".

Generate search filters for two types of potential co-founders/early hires:
1. Technical: engineers, architects, CTOs with relevant domain experience
2. Growth: product, marketing, growth people

Return ONLY valid JSON:
{
  "techTitles": ["Software Engineer", "Full Stack Engineer", "CTO", "Tech Lead", "Engineering Manager"],
  "growthTitles": ["Growth", "Product Manager", "Head of Marketing", "Head of Growth", "COO"],
  "industries": ["${industry}", "Technology"],
  "regions": ["United States"]
}

Tailor titles to the specific product domain. No markdown fences. No explanation. Just the JSON.`,
        },
      ],
    });

    const aiText = aiRes.content[0].type === "text" ? aiRes.content[0].text : "{}";
    const cleaned = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const filters = JSON.parse(cleaned) as {
      techTitles: string[];
      growthTitles: string[];
      industries: string[];
      regions: string[];
    };

    // Build conditions for technical search
    const buildConditions = (titles: string[]) => {
      const conditions: Array<
        | { column: string; type: string; value: string | string[] | number }
        | { op: string; conditions: Array<{ column: string; type: string; value: string | string[] | number }> }
      > = [];

      if (titles.length === 1) {
        conditions.push({ column: "current_employers.title", type: "(.)", value: titles[0] });
      } else {
        conditions.push({
          op: "or",
          conditions: titles.map((t) => ({
            column: "current_employers.title", type: "(.)" as const, value: t,
          })),
        });
      }

      if (filters.industries && filters.industries.length > 0) {
        conditions.push({
          column: "current_employers.company_industries",
          type: "in",
          value: filters.industries,
        });
      }

      conditions.push({
        column: "current_employers.seniority_level",
        type: "in",
        value: ["Lead", "Manager", "Director", "CXO"],
      });

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

      return conditions;
    };

    const techConditions = buildConditions(filters.techTitles || ["Software Engineer", "CTO", "Tech Lead"]);
    const growthConditions = buildConditions(filters.growthTitles || ["Product Manager", "Head of Growth", "COO"]);

    console.log("[find-teammates] Running parallel searches for tech + growth");

    // Run both searches in parallel
    const [techResult, growthResult] = await Promise.allSettled([
      searchPeople(techConditions, 25),
      searchPeople(growthConditions, 25),
    ]);

    const allContacts: Contact[] = [];

    if (techResult.status === "fulfilled") {
      const techContacts = techResult.value
        .map((p, i) => mapPersonToContact(p, i))
        .filter((c): c is Contact => c !== null)
        .map((c) => ({
          ...c,
          roleTag: "technical_evaluator" as const,
          matchReason: `${c.title} at ${c.company} — technical expertise in ${industry}`,
        }));
      allContacts.push(...techContacts);
      console.log("[find-teammates] Found", techContacts.length, "technical profiles");
    } else {
      console.error("[find-teammates] Tech search failed:", techResult.reason);
    }

    if (growthResult.status === "fulfilled") {
      const growthContacts = growthResult.value
        .map((p, i) => mapPersonToContact(p, i + 100))
        .filter((c): c is Contact => c !== null)
        .map((c) => ({
          ...c,
          roleTag: "champion" as const,
          matchReason: `${c.title} at ${c.company} — growth/ops experience in ${industry}`,
        }));
      allContacts.push(...growthContacts);
      console.log("[find-teammates] Found", growthContacts.length, "growth profiles");
    } else {
      console.error("[find-teammates] Growth search failed:", growthResult.reason);
    }

    return NextResponse.json({ contacts: allContacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-teammates] Error:", err.message);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
