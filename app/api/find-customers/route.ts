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

    const people = await searchPeople(conditions, 100);
    const contacts = people
      .map((p, i) => mapPersonToContact(p, i))
      .filter((c): c is Contact => c !== null);

    return NextResponse.json({ contacts, dataSource: "live" });
  } catch (error) {
    console.error("Crustdata find-customers error:", error);
    const mockData = getBuilderMockData("sales");
    return NextResponse.json({ contacts: mockData.contacts, dataSource: "mock" });
  }
}
