import { NextRequest, NextResponse } from "next/server";
import { enrichPersonFull, getPersonLinkedInPosts } from "@/lib/crustdata";
import type { FounderProfile } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { linkedinUrl } = (await req.json()) as { linkedinUrl: string };

  if (!linkedinUrl) {
    return NextResponse.json({ error: "linkedinUrl required" }, { status: 400 });
  }

  try {
    // Fetch profile and recent posts in parallel
    const [person, posts] = await Promise.allSettled([
      enrichPersonFull(linkedinUrl),
      getPersonLinkedInPosts(linkedinUrl, 1),
    ]);

    const profile = person.status === "fulfilled" ? person.value : null;
    const recentPosts = posts.status === "fulfilled" ? posts.value : [];

    if (!profile) {
      return NextResponse.json({ error: "Could not find profile" }, { status: 404 });
    }

    const employer = profile.current_employers?.[0];

    // Extract past companies (all employers beyond current)
    const pastCompanies = profile.current_employers
      ?.slice(1)
      .map((e) => e.employer_name || e.company_name || "")
      .filter(Boolean) || [];

    const founder: FounderProfile = {
      id: `founder-${Date.now()}`,
      linkedinUrl,
      name: profile.name || "Unknown",
      firstName: profile.first_name || (profile.name || "").split(" ")[0] || "Unknown",
      headline: profile.headline,
      profilePhotoUrl: profile.profile_picture_url || undefined,
      company: employer?.employer_name || employer?.company_name,
      pastCompanies: pastCompanies.length > 0 ? pastCompanies : undefined,
      recentPosts: recentPosts.length > 0
        ? recentPosts.slice(0, 5).map((p) => ({
            content: p.content,
            reactions: p.reactions,
            comments: p.comments,
          }))
        : undefined,
    };

    return NextResponse.json({ founder });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[enrich-founder] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
