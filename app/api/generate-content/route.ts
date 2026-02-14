import { NextRequest, NextResponse } from "next/server";
import { generatePosts, generateContextualEmails } from "@/lib/ai-content";
import type { AudienceGroup, Contact, ViabilityAnalysis } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const {
    description,
    appName,
    shareUrl,
    audienceGroups,
    viabilityAnalysis,
    contacts,
    projectGoal,
  } = (await req.json()) as {
    description: string;
    appName: string;
    shareUrl: string;
    audienceGroups: AudienceGroup[];
    viabilityAnalysis?: ViabilityAnalysis;
    contacts: Contact[];
    projectGoal?: import("@/lib/types").ProjectGoal;
  };

  const errors: string[] = [];

  // Run posts and emails in parallel
  const [postsResult, emailsResult] = await Promise.allSettled([
    generatePosts(description, appName, audienceGroups, viabilityAnalysis, projectGoal),
    generateContextualEmails(
      contacts,
      audienceGroups,
      appName,
      description,
      shareUrl,
      projectGoal
    ),
  ]);

  const posts =
    postsResult.status === "fulfilled" ? postsResult.value : [];
  if (postsResult.status === "rejected") {
    console.error("[generate-content] Posts failed:", postsResult.reason);
    errors.push(`posts: ${postsResult.reason?.message || String(postsResult.reason)}`);
  } else {
    console.log("[generate-content] Generated", posts.length, "posts");
  }

  const emailDrafts =
    emailsResult.status === "fulfilled" ? emailsResult.value : [];
  if (emailsResult.status === "rejected") {
    console.error("[generate-content] Emails failed:", emailsResult.reason);
    errors.push(`emails: ${emailsResult.reason?.message || String(emailsResult.reason)}`);
  } else {
    console.log("[generate-content] Generated", emailDrafts.length, "email drafts");
  }

  return NextResponse.json({
    posts,
    emailDrafts,
    _errors: errors.length > 0 ? errors : undefined,
  });
}
