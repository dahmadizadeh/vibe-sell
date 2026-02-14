import { NextRequest, NextResponse } from "next/server";
import { searchPeople, mapPersonToContact, normalizeCompanyName } from "@/lib/crustdata";
import type { Contact, RoleTag } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { company, titles } = (await req.json()) as { company: string; titles?: string[] };

  try {
    const conditions: Array<
      | { column: string; type: string; value: string | string[] | number }
      | { op: string; conditions: Array<{ column: string; type: string; value: string }> }
    > = [
      {
        column: "current_employers.company_website_domain",
        type: "(.)",
        value: normalizeCompanyName(company).toLowerCase(),
      },
      {
        column: "current_employers.seniority_level",
        type: "in",
        value: ["CXO", "Vice President", "Director", "Manager"],
      },
    ];

    // Use nested OR blocks for multiple titles (not OR-joined strings)
    if (titles && titles.length > 0) {
      if (titles.length === 1) {
        conditions.push({
          column: "current_employers.title",
          type: "(.)",
          value: titles[0],
        });
      } else {
        conditions.push({
          op: "or",
          conditions: titles.map((title) => ({
            column: "current_employers.title",
            type: "(.)" as const,
            value: title,
          })),
        });
      }
    }

    console.log("[find-contacts] Searching for:", company, "conditions:", JSON.stringify(conditions, null, 2));

    const people = await searchPeople(conditions as Parameters<typeof searchPeople>[0], 25);
    console.log("[find-contacts] Crustdata returned", people.length, "people");

    const allContacts = people
      .map((p, i) => mapPersonToContact(p, i))
      .filter((c): c is Contact => c !== null);

    // Group by role tag and cap: 3 decision_makers + 4 champions + 3 technical_evaluators
    const caps: Record<RoleTag, number> = {
      decision_maker: 3,
      champion: 4,
      technical_evaluator: 3,
    };
    const counts: Record<RoleTag, number> = {
      decision_maker: 0,
      champion: 0,
      technical_evaluator: 0,
    };
    const contacts: Contact[] = [];

    for (const contact of allContacts) {
      const tag = contact.roleTag || "champion";
      if (counts[tag] < caps[tag]) {
        contacts.push(contact);
        counts[tag]++;
      }
      if (contacts.length >= 10) break;
    }

    return NextResponse.json({ contacts, dataSource: "live" });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-contacts] Crustdata error:", err.message);
    console.error("[find-contacts] Stack:", err.stack);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
