import { NextRequest, NextResponse } from "next/server";
import { searchPeople, mapPersonToContact, headcountToFilterBuckets } from "@/lib/crustdata";
import { getBuilderMockData } from "@/lib/mock-data";
import type { Targeting, Contact } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { targeting } = (await req.json()) as { targeting: Targeting };

  try {
    const conditions: Array<{ column: string; type: string; value: string | string[] | number }> = [];

    // Industries
    if (targeting.industries.length > 0) {
      conditions.push({
        column: "current_employers.company_industries",
        type: "in",
        value: targeting.industries,
      });
    }

    // Company size → headcount buckets
    if (targeting.companySize.min > 0 || targeting.companySize.max > 0) {
      const buckets = headcountToFilterBuckets(
        targeting.companySize.min,
        targeting.companySize.max
      );
      if (buckets.length > 0) {
        conditions.push({
          column: "current_employers.company_headcount_latest",
          type: "in",
          value: buckets,
        });
      }
    }

    // Titles — fuzzy OR match
    if (targeting.titles.length > 0) {
      conditions.push({
        column: "current_employers.title",
        type: "(.)",
        value: targeting.titles.join(" OR "),
      });
    }

    // Seniority
    conditions.push({
      column: "current_employers.seniority_level",
      type: "in",
      value: ["CXO", "Vice President", "Director", "Manager", "Lead"],
    });

    // Regions — fuzzy match
    if (targeting.regions.length > 0) {
      conditions.push({
        column: "region",
        type: "(.)",
        value: targeting.regions.join(" OR "),
      });
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
    const mockData = getBuilderMockData("sales");
    return NextResponse.json({ contacts: mockData.contacts, dataSource: "mock", _source: "mock", _error: err.message });
  }
}
