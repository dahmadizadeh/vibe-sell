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
    // Use Claude to generate investor-specific Crustdata conditions
    const aiRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a startup fundraising advisor. A founder built "${appName}" in "${industry}": "${description}".

Generate TWO investor search groups with Crustdata filter conditions:

Group 1: "VCs in This Space"
- Partners/principals at VC firms who invest in ${industry} or adjacent spaces
- Use title filters for "Partner", "Principal", "Managing Director", "Investor"
- Industry filter: "Venture Capital & Private Equity" (required)
- Include seniority filter for senior roles

Group 2: "Angels & Operators"
- People who angel invest and have domain expertise in ${industry}
- Former founders or executives who might angel invest
- Use title filters like "Angel", "Advisor", "Board Member", "Founder" at investment-related firms
- Industry filter should include both VC and ${industry}

For each group, generate Crustdata conditions as arrays of filter objects.
Available columns:
- "current_employers.title" (type: "(.)" fuzzy)
- "current_employers.company_industries" (type: "in" list match)
- "current_employers.seniority_level" (type: "in") — values: "CXO", "Vice President", "Director", "Partner"
- "region" (type: "(.)" fuzzy)

For multiple titles use: { "op": "or", "conditions": [...] }

Return ONLY valid JSON:
{
  "groups": [
    {
      "name": "VCs in This Space",
      "conditions": [...crustdata filter conditions...],
      "matchReasonTemplate": "{title} at {company} — invests in ${industry} startups",
      "limit": 25
    },
    {
      "name": "Angels & Operators",
      "conditions": [...crustdata filter conditions...],
      "matchReasonTemplate": "{title} at {company} — domain expertise in {industry}",
      "limit": 25
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

    console.log("[find-investors] AI generated", parsed.groups?.length, "investor groups");

    // Search both groups in parallel
    const allContacts: Contact[] = [];
    const results = await Promise.allSettled(
      (parsed.groups || []).map((group) =>
        searchPeople(group.conditions as Parameters<typeof searchPeople>[0], group.limit || 25)
      )
    );

    results.forEach((result, i) => {
      const group = parsed.groups[i];
      if (result.status === "fulfilled") {
        const contacts = result.value
          .map((p, j) => mapPersonToContact(p, i * 100 + j, group.matchReasonTemplate))
          .filter((c): c is Contact => c !== null)
          .map((c) => ({
            ...c,
            roleTag: "decision_maker" as const,
            contactCategory: "investors" as const,
          }));
        allContacts.push(...contacts);
        console.log(`[find-investors] ${group.name}: found ${contacts.length} contacts`);
      } else {
        console.error(`[find-investors] ${group.name} search failed:`, result.reason);
      }
    });

    return NextResponse.json({ contacts: allContacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-investors] Error:", err.message);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
