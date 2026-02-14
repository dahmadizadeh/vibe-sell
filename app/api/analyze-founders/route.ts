import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { FounderProfile, GrowthIntelligence, ProjectGoal } from "@/lib/types";
import { getGoalContext } from "@/lib/ai-analyze";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { founders, description, appName, projectGoal, competitors } = (await req.json()) as {
    founders: FounderProfile[];
    description: string;
    appName: string;
    projectGoal?: ProjectGoal;
    competitors?: string[];
  };

  if (!founders || founders.length === 0) {
    return NextResponse.json({ error: "No founders provided" }, { status: 400 });
  }

  try {
    const founderSummaries = founders.map((f) => ({
      name: f.name,
      headline: f.headline,
      company: f.company,
      pastCompanies: f.pastCompanies,
      education: f.education,
      skills: f.skills,
      connectionCount: f.connectionCount,
      recentPostPerformance: f.recentPosts
        ? `${f.recentPosts.length} recent posts, avg ${Math.round(f.recentPosts.reduce((a, p) => a + p.reactions, 0) / f.recentPosts.length)} reactions`
        : "No recent posts",
    }));

    const goalContext = getGoalContext(projectGoal);

    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `Analyze these founder profiles for "${appName}": ${description}${goalContext}
${competitors?.length ? `\nCompetitors: ${competitors.join(", ")}` : ""}

Founders:
${JSON.stringify(founderSummaries, null, 2)}

Provide growth intelligence across 5 categories. Be specific to THESE founders and THIS product:

1. NETWORK LEVERAGE: How can these founders' connections accelerate growth? Which companies/people in their network should they reach out to first?
2. CONTENT AUTHORITY: Based on their LinkedIn activity, what content strategy should they pursue? What topics would resonate?
3. WARM INTRO PATHS: What warm introductions are likely available through their past companies and connections?
4. CREDIBILITY SIGNALS: What in their background lends credibility to this product? How to use this in outreach?
5. CHANNEL FIT: Which 3-5 specific growth channels fit best given their background? (e.g., "LinkedIn thought leadership", "YC network", "enterprise sales via past contacts")

Return ONLY valid JSON:
{
  "networkLeverage": "2-3 sentences...",
  "contentAuthority": "2-3 sentences...",
  "warmIntroPaths": "2-3 sentences...",
  "credibilitySignals": "2-3 sentences...",
  "channelFit": ["Channel 1", "Channel 2", "Channel 3"]
}

No markdown. Just JSON.`,
        },
      ],
    });

    const text = res.content[0].type === "text" ? res.content[0].text : "{}";
    const growthIntelligence: GrowthIntelligence = JSON.parse(
      text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    );

    return NextResponse.json({ growthIntelligence });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[analyze-founders] Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
