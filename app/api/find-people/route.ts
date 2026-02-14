import { NextRequest, NextResponse } from "next/server";
import { searchPeople, mapPersonToContact } from "@/lib/crustdata";
import type { Contact } from "@/lib/types";

export const maxDuration = 60;

/**
 * Accepts raw Crustdata filter conditions + matchReasonTemplate.
 * Used for audience-group-specific searches where the AI generated
 * Crustdata conditions directly (instead of flat Targeting objects).
 */
export async function POST(req: NextRequest) {
  const { conditions, limit, matchReasonTemplate } = (await req.json()) as {
    conditions: Array<Record<string, unknown>>;
    limit?: number;
    matchReasonTemplate?: string;
  };

  try {
    console.log("[find-people] Searching with conditions:", JSON.stringify(conditions, null, 2));

    const people = await searchPeople(conditions as Parameters<typeof searchPeople>[0], limit || 25);
    console.log("[find-people] Crustdata returned", people.length, "people");

    const contacts = people
      .map((p, i) => mapPersonToContact(p, i, matchReasonTemplate))
      .filter((c): c is Contact => c !== null);

    return NextResponse.json({ contacts, dataSource: "live" });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-people] Error:", err.message);
    return NextResponse.json({ contacts: [], dataSource: "error", _error: err.message }, { status: 200 });
  }
}
