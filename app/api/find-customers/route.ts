import { NextRequest, NextResponse } from "next/server";
import { searchPeople, mapPersonToContact } from "@/lib/crustdata";
import type { Targeting, Contact } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { targeting } = (await req.json()) as { targeting: Targeting };

  try {
    const conditions: Array<
      | { column: string; type: string; value: string | string[] | number }
      | { op: string; conditions: Array<{ column: string; type: string; value: string | string[] | number }> }
    > = [];

    // Industries — case-sensitive list match
    if (targeting.industries.length > 0) {
      conditions.push({
        column: "current_employers.company_industries",
        type: "in",
        value: targeting.industries,
      });
    }

    // Company size — numeric range using >= and <= operators
    if (targeting.companySize.min > 0) {
      conditions.push({
        column: "current_employers.company_headcount_latest",
        type: "=>",
        value: targeting.companySize.min,
      });
    }
    if (targeting.companySize.max > 0) {
      conditions.push({
        column: "current_employers.company_headcount_latest",
        type: "=<",
        value: targeting.companySize.max,
      });
    }

    // Titles — nested OR block with fuzzy match per title
    if (targeting.titles.length > 0) {
      if (targeting.titles.length === 1) {
        conditions.push({
          column: "current_employers.title",
          type: "(.)",
          value: targeting.titles[0],
        });
      } else {
        conditions.push({
          op: "or",
          conditions: targeting.titles.map((title) => ({
            column: "current_employers.title",
            type: "(.)" as const,
            value: title,
          })),
        });
      }
    }

    // Seniority — list match
    conditions.push({
      column: "current_employers.seniority_level",
      type: "in",
      value: ["CXO", "Vice President", "Director", "Manager", "Lead"],
    });

    // Regions — nested OR block with fuzzy match per region
    if (targeting.regions.length > 0) {
      if (targeting.regions.length === 1) {
        conditions.push({
          column: "region",
          type: "(.)",
          value: targeting.regions[0],
        });
      } else {
        conditions.push({
          op: "or",
          conditions: targeting.regions.map((region) => ({
            column: "region",
            type: "(.)" as const,
            value: region,
          })),
        });
      }
    }

    console.log("[find-customers] Crustdata request:", JSON.stringify({ filters: { op: "and", conditions }, limit: 100 }, null, 2));

    const people = await searchPeople(conditions, 100);
    console.log("[find-customers] Crustdata returned", people.length, "people");

    const contacts = people
      .map((p, i) => mapPersonToContact(p, i))
      .filter((c): c is Contact => c !== null);

    return NextResponse.json({ contacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-customers] Crustdata error:", err.message);
    console.error("[find-customers] Stack:", err.stack);
    console.error("[find-customers] CRUSTDATA_API_KEY set?", !!process.env.CRUSTDATA_API_KEY);
    console.error("[find-customers] CRUSTDATA_API_KEY length:", process.env.CRUSTDATA_API_KEY?.length ?? 0);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
