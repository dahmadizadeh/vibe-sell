import { NextRequest, NextResponse } from "next/server";
import { enrichPeople } from "@/lib/crustdata";

export async function POST(req: NextRequest) {
  const { linkedinUrls } = (await req.json()) as { linkedinUrls: string[] };

  try {
    const results = await enrichPeople(linkedinUrls);
    const enriched = results
      .filter((r) => r.business_email || r.profile_photo_url)
      .map((r) => ({
        linkedinUrl: r.linkedin_profile_url,
        email: r.business_email,
        profilePhotoUrl: r.profile_photo_url,
      }));

    return NextResponse.json({ enriched });
  } catch (error) {
    console.error("Crustdata enrich-contacts error:", error);
    return NextResponse.json({ enriched: [] });
  }
}
