import { NextRequest, NextResponse } from "next/server";
import { searchPeople, mapPersonToContact } from "@/lib/crustdata";
import type { Contact, ProjectGoal } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";
import { getGoalContext } from "@/lib/ai-analyze";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { description, appName, industry, projectGoal } = (await req.json()) as {
    description: string;
    appName: string;
    industry: string;
    projectGoal?: ProjectGoal;
  };

  try {
    // Step 1: Search VCs with known-working filters
    // Use the EXACT industry string Crustdata expects for VC firms
    const vcConditions = [
      {
        op: "or",
        conditions: [
          { column: "current_employers.title", type: "(.)", value: "partner" },
          { column: "current_employers.title", type: "(.)", value: "principal" },
          { column: "current_employers.title", type: "(.)", value: "investor" },
          { column: "current_employers.title", type: "(.)", value: "managing director" },
          { column: "current_employers.title", type: "(.)", value: "venture" },
        ],
      },
      {
        column: "current_employers.company_industries",
        type: "in",
        value: ["Venture Capital and Private Equity Principals"],
      },
    ];

    console.log("[find-investors] Searching VCs with conditions:", JSON.stringify(vcConditions, null, 2));

    let vcProfiles = await searchPeople(vcConditions as Parameters<typeof searchPeople>[0], 25);
    console.log("[find-investors] VC search returned", vcProfiles.length, "profiles");

    // If primary VC search returns 0, try broader fallback
    if (vcProfiles.length === 0) {
      console.log("[find-investors] Primary VC search empty, trying broader fallback...");
      const fallbackConditions = [
        {
          op: "or",
          conditions: [
            { column: "current_employers.title", type: "(.)", value: "venture capital" },
            { column: "current_employers.title", type: "(.)", value: "angel investor" },
            { column: "headline", type: "(.)", value: "investor" },
          ],
        },
      ];
      vcProfiles = await searchPeople(fallbackConditions as Parameters<typeof searchPeople>[0], 25);
      console.log("[find-investors] Fallback search returned", vcProfiles.length, "profiles");
    }

    // Step 2: Use Claude to generate personalized match reasons
    const vcContacts = vcProfiles
      .map((p, i) => mapPersonToContact(p, i))
      .filter((c): c is Contact => c !== null)
      .map((c) => ({
        ...c,
        roleTag: "decision_maker" as const,
        contactCategory: "investors" as const,
      }));

    // Step 3: Enrich match reasons with AI
    if (vcContacts.length > 0) {
      try {
        const peopleList = vcContacts.slice(0, 20).map((c, i) =>
          `${i + 1}. ${c.name}, ${c.title} at ${c.company} (${c.companySize} employees, ${c.industry})`
        ).join("\n");

        const reasonRes = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [{
            role: "user",
            content: `For the product "${appName}" in ${industry}: "${description}"${getGoalContext(projectGoal)}

Generate a one-sentence match reason for each investor explaining why the founder of ${appName} should reach out to them. Be specific about the connection between their investment focus/firm and this product.

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
          const contact = vcContacts[r.idx - 1];
          if (contact && r.matchReason) {
            contact.matchReason = r.matchReason;
          }
        }
      } catch (err) {
        console.error("[find-investors] Match reason enrichment failed:", err);
        // Keep the template-based reasons as fallback
      }
    }

    return NextResponse.json({ contacts: vcContacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-investors] Error:", err.message);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
