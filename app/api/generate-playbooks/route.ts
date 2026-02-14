import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { GrowthPlaybook } from "@/lib/types";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { description, appName, industry, competitors, viabilityAnalysis, projectGoal } = (await req.json()) as {
    description: string;
    appName: string;
    industry: string;
    competitors?: string[];
    viabilityAnalysis?: { summary: string; topOpportunities: string[] };
    projectGoal?: import("@/lib/types").ProjectGoal;
  };

  const goalContextMap: Record<string, string> = {
    side_project: "\n\nThis is a SIDE PROJECT. Focus playbooks on: validation experiments, finding first 10 users, community-driven growth, low-cost tactics.",
    small_business: "\n\nThis is a SMALL BUSINESS. Focus playbooks on: acquiring paying customers, sustainable channels, unit economics, referral programs.",
    venture_scale: "\n\nThis is a VENTURE-SCALE STARTUP. Focus playbooks on: design partners, enterprise sales, investor outreach, rapid scaling, network effects.",
  };
  const goalContext = projectGoal ? (goalContextMap[projectGoal] || "") : "";

  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are a startup growth strategist. Create 4-6 actionable growth playbooks for "${appName}" in ${industry}: "${description}".${goalContext}
${competitors?.length ? `\nCompetitors: ${competitors.join(", ")}` : ""}
${viabilityAnalysis ? `\nViability summary: ${viabilityAnalysis.summary}\nTop opportunities: ${viabilityAnalysis.topOpportunities.join(", ")}` : ""}

Each playbook should be a specific, step-by-step strategy the founder can execute in 1-2 weeks. Focus on early-stage traction tactics.

Return ONLY a JSON array where each item has:
{
  "title": "Short title (3-5 words)",
  "icon": "Single emoji",
  "description": "One sentence explaining the strategy",
  "steps": ["Step 1...", "Step 2...", "Step 3...", "Step 4..."],
  "relevance": "Why this matters for this specific product"
}

Include a mix of: content marketing, community building, outbound sales, partnerships, product-led growth.
No markdown fences. No explanation. Just the JSON array.`,
        },
      ],
    });

    const text = res.content[0].type === "text" ? res.content[0].text : "[]";
    const parsed: Array<Omit<GrowthPlaybook, "id">> = JSON.parse(
      text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    );

    const playbooks: GrowthPlaybook[] = parsed.map((p, i) => ({
      id: `pb-${i}-${Date.now()}`,
      ...p,
    }));

    return NextResponse.json({ playbooks });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[generate-playbooks] Error:", err.message);
    return NextResponse.json({ playbooks: [], _error: err.message }, { status: 200 });
  }
}
