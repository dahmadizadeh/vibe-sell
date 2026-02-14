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
    // Use Claude to generate teammate-specific Crustdata conditions
    const aiRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a startup hiring advisor. A founder is building "${appName}" in "${industry}": "${description}".

Generate TWO teammate search groups with Crustdata filter conditions:

Group 1: "Engineers" (people who could BUILD this product)
- Engineers/CTOs with experience relevant to this specific product
- Use titles like "Software Engineer", "Full Stack", "CTO", "Tech Lead", "Engineering Manager"
- Filter by industries related to ${industry} (NOT "Venture Capital")
- Search for people at companies of relevant size (growth-stage, 11-500 employees)
- Include seniority: "Lead", "Manager", "Director", "CXO"

Group 2: "Growth & Operations" (people who could GROW this product)
- Product, marketing, growth, community people with domain experience in ${industry}
- Use titles like "Product Manager", "Growth", "Marketing", "Head of", "Community"
- Filter by industries related to ${industry}
- Include seniority: "Manager", "Director", "Vice President", "CXO"

For each group, generate Crustdata conditions as arrays of filter objects.
Available columns:
- "current_employers.title" (type: "(.)" fuzzy)
- "current_employers.company_industries" (type: "in" list match)
- "current_employers.seniority_level" (type: "in") — values: "CXO", "Vice President", "Director", "Manager", "Senior", "Lead"
- "current_employers.company_headcount_latest" (type: "=>") — minimum headcount
- "current_employers.company_headcount_latest" (type: "=<") — maximum headcount
- "region" (type: "(.)" fuzzy)

For multiple titles use: { "op": "or", "conditions": [...] }

Return ONLY valid JSON:
{
  "groups": [
    {
      "name": "Engineers",
      "conditions": [...crustdata filter conditions...],
      "matchReasonTemplate": "{title} at {company} — could build ${appName}'s technical foundation",
      "limit": 15
    },
    {
      "name": "Growth & Operations",
      "conditions": [...crustdata filter conditions...],
      "matchReasonTemplate": "{title} at {company} — could drive ${appName}'s growth in {industry}",
      "limit": 15
    }
  ]
}

No markdown fences. No explanation. Just the JSON.`,
        },
      ],
    });

    const aiText = aiRes.content[0].type === "text" ? aiRes.content[0].text : "{}";
    const cleaned = aiText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      groups: Array<{
        name: string;
        conditions: Array<Record<string, unknown>>;
        matchReasonTemplate: string;
        limit: number;
      }>;
    };

    console.log("[find-teammates] AI generated", parsed.groups?.length, "teammate groups");

    // Search both groups in parallel
    const allContacts: Contact[] = [];
    const results = await Promise.allSettled(
      (parsed.groups || []).map((group) =>
        searchPeople(group.conditions as Parameters<typeof searchPeople>[0], group.limit || 15)
      )
    );

    results.forEach((result, i) => {
      const group = parsed.groups[i];
      if (result.status === "fulfilled") {
        const isEngineer = group.name.toLowerCase().includes("engineer");
        const contacts = result.value
          .map((p, j) => mapPersonToContact(p, i * 100 + j, group.matchReasonTemplate))
          .filter((c): c is Contact => c !== null)
          .map((c) => ({
            ...c,
            roleTag: isEngineer ? "technical_evaluator" as const : "champion" as const,
            contactCategory: "teammates" as const,
          }));
        allContacts.push(...contacts);
        console.log(`[find-teammates] ${group.name}: found ${contacts.length} contacts`);
      } else {
        console.error(`[find-teammates] ${group.name} search failed:`, result.reason);
      }
    });

    return NextResponse.json({ contacts: allContacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-teammates] Error:", err.message);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
