import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { FounderProfile, GrowthChecklist, ProjectGoal, AudienceGroup, LinkedInPost } from "@/lib/types";
import { getGoalContext } from "@/lib/ai-analyze";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { founders, description, appName, projectGoal, competitors, audienceGroups, linkedInPosts, viabilityScore } = (await req.json()) as {
    founders: FounderProfile[];
    description: string;
    appName: string;
    projectGoal?: ProjectGoal;
    competitors?: string[];
    audienceGroups?: AudienceGroup[];
    linkedInPosts?: LinkedInPost[];
    viabilityScore?: number;
  };

  if (!founders || founders.length === 0) {
    return NextResponse.json({ error: "No founders provided" }, { status: 400 });
  }

  try {
    const founderSummaries = founders.map((f) => {
      const avgReactions = f.recentPosts && f.recentPosts.length > 0
        ? Math.round(f.recentPosts.reduce((a, p) => a + p.reactions, 0) / f.recentPosts.length)
        : 0;
      return `- ${f.name}: ${f.headline || "No headline"}
  Past companies: ${f.pastCompanies?.join(", ") || "Unknown"}
  Education: ${f.education?.join(", ") || "Unknown"}
  Skills: ${f.skills?.join(", ") || "Unknown"}
  LinkedIn connections: ${f.connectionCount || "Unknown"}
  Recent posts: ${f.recentPosts?.length || 0} posts, avg ${avgReactions} reactions`;
    }).join("\n");

    const goalContext = getGoalContext(projectGoal);

    const audienceContext = audienceGroups && audienceGroups.length > 0
      ? `\nAudience groups found: ${audienceGroups.map((g) => `${g.name} (${g.contacts?.length || 0} people)`).join(", ")}`
      : "";

    const postContext = linkedInPosts && linkedInPosts.length > 0
      ? `\nLinkedIn posts found about this space: ${linkedInPosts.slice(0, 5).map((p) => `"${p.postContent.slice(0, 80)}..." by ${p.authorName}`).join("; ")}`
      : "";

    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are a tactical growth advisor. Given the founder profiles and product below, create a SPECIFIC, ACTIONABLE checklist of the first 15-20 things this founder should do to get their first users/customers.

Product: ${appName} — ${description}${goalContext}
${competitors?.length ? `Competitors: ${competitors.join(", ")}` : ""}
${viabilityScore ? `Viability score: ${viabilityScore}/100` : ""}${audienceContext}${postContext}

Founder profiles:
${founderSummaries}

For EACH checklist item:
- Start with a verb (Post, Email, DM, Search, Join, Comment, Share, Ask, Apply, Write)
- Be SPECIFIC — use real names of companies, networks, platforms, and people types from the founder's background
- Include the WHY in parentheses
- Mark effort: "quick" (15 min), "medium" (1-2 hours), "long" (1 day+)
- If the item relates to the People tab, set linkTo: "people". If it relates to LinkedIn Posts tab, set linkTo: "linkedin". If it relates to Go-to-Market Content tab, set linkTo: "content".

ORGANIZE into these 5 sections:

1. "this-week" / "This Week" — Things the founder can do today with zero setup
2. "content-linkedin" / "Content & LinkedIn" — Specific post topics, engagement tactics based on what works for this founder
3. "network-activation" / "Network Activation" — Specific people and networks to tap based on the founder's actual background
4. "direct-outreach" / "Direct Outreach" — Who to email/DM first based on the people found
5. "growth-loops" / "Growth Loops" — Repeatable systems to set up

DO NOT write generic advice. Be specific to THIS founder and THIS product. Reference their actual past companies, skills, and post performance.

Return ONLY valid JSON:
{
  "sections": [
    {
      "id": "this-week",
      "title": "This Week",
      "icon": "fire",
      "items": [
        { "text": "Post on...", "why": "Because...", "effort": "quick", "linkTo": null },
        { "text": "DM 5...", "why": "They need...", "effort": "quick", "linkTo": "people" }
      ]
    }
  ]
}

No markdown fences. No explanation. Just the JSON.`,
        },
      ],
    });

    const text = res.content[0].type === "text" ? res.content[0].text : "{}";
    const growthChecklist: GrowthChecklist = JSON.parse(
      text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    );

    // Ensure sections have the right structure
    if (!growthChecklist.sections) {
      growthChecklist.sections = [];
    }
    growthChecklist.checkedItems = [];

    return NextResponse.json({ growthChecklist });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[analyze-founders] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
