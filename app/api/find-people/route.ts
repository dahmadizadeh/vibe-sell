import { NextRequest, NextResponse } from "next/server";
import { searchPeople, mapPersonToContact } from "@/lib/crustdata";
import type { Contact, ProjectGoal } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";
import { getGoalContext } from "@/lib/ai-analyze";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Accepts raw Crustdata filter conditions + matchReasonTemplate.
 * Used for audience-group-specific searches where the AI generated
 * Crustdata conditions directly (instead of flat Targeting objects).
 * Now also enriches match reasons via Claude for personalized results.
 */
export async function POST(req: NextRequest) {
  const { conditions, limit, matchReasonTemplate, appName, description, projectGoal } = (await req.json()) as {
    conditions: Array<Record<string, unknown>>;
    limit?: number;
    matchReasonTemplate?: string;
    appName?: string;
    description?: string;
    projectGoal?: ProjectGoal;
  };

  try {
    console.log("[find-people] Searching with conditions:", JSON.stringify(conditions, null, 2));

    const people = await searchPeople(conditions as Parameters<typeof searchPeople>[0], limit || 25);
    console.log("[find-people] Crustdata returned", people.length, "people");

    const contacts = people
      .map((p, i) => mapPersonToContact(p, i, matchReasonTemplate))
      .filter((c): c is Contact => c !== null);

    // Enrich match reasons with AI if product context is provided
    if (contacts.length > 0 && appName && description) {
      try {
        const peopleList = contacts.slice(0, 25).map((c, i) =>
          `${i + 1}. ${c.name}, ${c.title} at ${c.company} (${c.companySize} employees, ${c.industry})`
        ).join("\n");

        const reasonRes = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{
            role: "user",
            content: `For the product "${appName}": "${description}"${getGoalContext(projectGoal)}

Generate a one-sentence match reason for each person explaining why the founder should reach out to them. Be specific about the connection between their role/company and this product.

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
          const contact = contacts[r.idx - 1];
          if (contact && r.matchReason) {
            contact.matchReason = r.matchReason;
          }
        }
        console.log("[find-people] Enriched", reasons.length, "match reasons with AI");
      } catch (err) {
        console.error("[find-people] Match reason enrichment failed:", err);
      }
    }

    return NextResponse.json({ contacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-people] Error:", err.message);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
