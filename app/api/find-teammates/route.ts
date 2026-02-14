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
    // Engineer search — known-working filter pattern
    const engineerConditions = [
      {
        op: "or",
        conditions: [
          { column: "current_employers.title", type: "(.)", value: "software engineer" },
          { column: "current_employers.title", type: "(.)", value: "full stack developer" },
          { column: "current_employers.title", type: "(.)", value: "frontend engineer" },
          { column: "current_employers.title", type: "(.)", value: "backend engineer" },
          { column: "current_employers.title", type: "(.)", value: "CTO" },
          { column: "current_employers.title", type: "(.)", value: "tech lead" },
          { column: "current_employers.title", type: "(.)", value: "engineering manager" },
        ],
      },
      { column: "current_employers.company_headcount_latest", type: "<", value: 200 },
    ];

    // Growth search — known-working filter pattern
    const growthConditions = [
      {
        op: "or",
        conditions: [
          { column: "current_employers.title", type: "(.)", value: "growth" },
          { column: "current_employers.title", type: "(.)", value: "marketing" },
          { column: "current_employers.title", type: "(.)", value: "community manager" },
          { column: "current_employers.title", type: "(.)", value: "head of marketing" },
          { column: "current_employers.title", type: "(.)", value: "content" },
          { column: "current_employers.title", type: "(.)", value: "product manager" },
        ],
      },
    ];

    console.log("[find-teammates] Searching engineers and growth people...");

    // Run both searches in parallel
    const [engineerResult, growthResult] = await Promise.allSettled([
      searchPeople(engineerConditions as Parameters<typeof searchPeople>[0], 15),
      searchPeople(growthConditions as Parameters<typeof searchPeople>[0], 15),
    ]);

    const allContacts: Contact[] = [];

    // Map engineers
    if (engineerResult.status === "fulfilled") {
      const engineers = engineerResult.value
        .map((p, i) => mapPersonToContact(p, i))
        .filter((c): c is Contact => c !== null)
        .map((c) => ({
          ...c,
          roleTag: "technical_evaluator" as const,
          contactCategory: "teammates" as const,
        }));
      allContacts.push(...engineers);
      console.log(`[find-teammates] Engineers: found ${engineers.length} contacts`);
    } else {
      console.error("[find-teammates] Engineer search failed:", engineerResult.reason);
    }

    // Map growth people
    if (growthResult.status === "fulfilled") {
      const growthPeople = growthResult.value
        .map((p, i) => mapPersonToContact(p, 100 + i))
        .filter((c): c is Contact => c !== null)
        .map((c) => ({
          ...c,
          roleTag: "champion" as const,
          contactCategory: "teammates" as const,
        }));
      allContacts.push(...growthPeople);
      console.log(`[find-teammates] Growth: found ${growthPeople.length} contacts`);
    } else {
      console.error("[find-teammates] Growth search failed:", growthResult.reason);
    }

    // Enrich match reasons with AI
    if (allContacts.length > 0) {
      try {
        const peopleList = allContacts.slice(0, 25).map((c, i) =>
          `${i + 1}. ${c.name}, ${c.title} at ${c.company} (${c.companySize} employees, ${c.industry}) [${c.roleTag === "technical_evaluator" ? "Engineer" : "Growth"}]`
        ).join("\n");

        const reasonRes = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{
            role: "user",
            content: `For the product "${appName}" in ${industry}: "${description}"

Generate a one-sentence match reason for each person explaining why they'd be a great co-founder or early hire for ${appName}. For engineers, focus on relevant technical experience. For growth people, focus on their domain expertise and audience access.

People:
${peopleList}

Return ONLY a JSON array: [{"idx": 1, "matchReason": "..."}]
No markdown fences.`,
          }],
        });

        const reasonText = reasonRes.content[0].type === "text" ? reasonRes.content[0].text : "[]";
        const reasons: Array<{ idx: number; matchReason: string }> = JSON.parse(
          reasonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
        );

        for (const r of reasons) {
          const contact = allContacts[r.idx - 1];
          if (contact && r.matchReason) {
            contact.matchReason = r.matchReason;
          }
        }
      } catch (err) {
        console.error("[find-teammates] Match reason enrichment failed:", err);
      }
    }

    return NextResponse.json({ contacts: allContacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-teammates] Error:", err.message);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
