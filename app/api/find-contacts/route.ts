import { NextRequest, NextResponse } from "next/server";
import { searchPeople, mapPersonToContact, normalizeCompanyName } from "@/lib/crustdata";
import { getSellerMockData } from "@/lib/mock-data";
import type { Contact, RoleTag } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { company, titles } = (await req.json()) as { company: string; titles?: string[] };

  try {
    const conditions = [
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

    if (titles && titles.length > 0) {
      conditions.push({
        column: "current_employers.title",
        type: "(.)",
        value: titles.join(" OR "),
      });
    }

    const people = await searchPeople(conditions, 25);
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
    console.error("Crustdata find-contacts error:", error);
    const mockData = getSellerMockData(company);
    return NextResponse.json({ contacts: mockData.contacts, dataSource: "mock" });
  }
}
