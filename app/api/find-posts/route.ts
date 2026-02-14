import { NextRequest, NextResponse } from "next/server";
import { searchLinkedInPosts } from "@/lib/crustdata";
import type { LinkedInPost, ProjectGoal } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";
import { getGoalContext } from "@/lib/ai-analyze";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { description, appName, industry, competitors, projectGoal } = (await req.json()) as {
    description: string;
    appName: string;
    industry: string;
    competitors?: string[];
    projectGoal?: ProjectGoal;
  };

  try {
    let keywords: string[];

    if (competitors && competitors.length > 0) {
      // Competitor-specific search: use competitor names directly as keywords
      keywords = competitors;
      console.log("[find-posts] Using competitor keywords:", keywords);
    } else {
      // Step 1: Generate search keywords from product description
      const keywordRes = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: `Generate 3-5 short LinkedIn search keyword phrases for finding posts relevant to "${appName}" in "${industry}": "${description}".

Each keyword should be 1-3 words. They will be joined with OR for a Crustdata LinkedIn post search.
Good examples: ["customer retention", "SaaS churn", "user onboarding"]
Bad examples: ["how to reduce customer churn in SaaS companies"] (too long)

Return ONLY a JSON array of strings. No markdown fences. No explanation. Just the JSON array.`,
          },
        ],
      });

      const keywordText = keywordRes.content[0].type === "text" ? keywordRes.content[0].text : "[]";
      keywords = JSON.parse(keywordText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());

      console.log("[find-posts] Generated keywords:", keywords);
    }

    // Step 2: Search LinkedIn posts via Crustdata
    const rawPosts = await searchLinkedInPosts(keywords, 30);
    console.log("[find-posts] Found", rawPosts.length, "raw posts");

    if (rawPosts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Step 2.5: Score posts for relevance and filter out noise
    const postsToScore = rawPosts.slice(0, 25).map((p, i) => ({
      idx: i,
      content: p.content.slice(0, 300),
      author: p.authorName,
      title: p.authorTitle,
    }));

    const scoredIndices: Map<number, number> = new Map();
    try {
      const scoreRes = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: `Score these LinkedIn posts for relevance to "${appName}" (${description.slice(0, 200)}).
${competitors?.length ? `Competitors: ${competitors.join(", ")}` : ""}

Score each 1-10:
1-3: Wrong language, spam, job posts, completely unrelated
4-5: Tangentially related
6-7: Related to the industry/problem space
8-10: Directly discusses the problem or competitors

Posts:
${JSON.stringify(postsToScore, null, 2)}

Return ONLY a JSON array of {idx, score}. No markdown. No explanation.`,
          },
        ],
      });
      const scoreText = scoreRes.content[0].type === "text" ? scoreRes.content[0].text : "[]";
      const scores: Array<{ idx: number; score: number }> = JSON.parse(
        scoreText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      );
      for (const s of scores) {
        scoredIndices.set(s.idx, s.score);
      }
      console.log("[find-posts] Scored", scores.length, "posts, keeping score >= 6");
    } catch (err) {
      console.warn("[find-posts] Relevance scoring failed, using all posts:", err);
      // Fallback: keep all posts
      rawPosts.forEach((_, i) => scoredIndices.set(i, 7));
    }

    // Filter to keep only relevant posts (score >= 6)
    const filteredPosts = rawPosts
      .slice(0, 25)
      .map((p, i) => ({ post: p, score: scoredIndices.get(i) ?? 5 }))
      .filter((item) => item.score >= 6)
      .sort((a, b) => b.score - a.score);

    console.log("[find-posts] After filtering:", filteredPosts.length, "relevant posts");

    if (filteredPosts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Step 3: Use Claude to analyze filtered posts and generate engagement strategies
    const postsForAnalysis = filteredPosts.slice(0, 15).map((item, i) => ({
      idx: i,
      author: item.post.authorName,
      title: item.post.authorTitle,
      company: item.post.authorCompany,
      content: item.post.content.slice(0, 500),
    }));

    const analysisRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are a LinkedIn engagement strategist. A founder built "${appName}": "${description}".${getGoalContext(projectGoal)}
${competitors?.length ? `\nCompetitors: ${competitors.join(", ")}. These posts mention competitors — the suggested comments should subtly position ${appName} as an alternative without being negative about the competitor.\n` : ""}
Analyze these LinkedIn posts and for each, explain why it's relevant and how the founder should engage.

Posts:
${JSON.stringify(postsForAnalysis, null, 2)}

Return ONLY a JSON array where each item has:
{
  "idx": 0,
  "whyRelevant": "Why this post matters for the founder",
  "commentStrategy": "How to engage with this post",
  "suggestedComment": "A ready-to-use comment (2-3 sentences, authentic, not salesy)"
}

No markdown fences. No explanation. Just the JSON array.`,
        },
      ],
    });

    const analysisText = analysisRes.content[0].type === "text" ? analysisRes.content[0].text : "[]";
    const analyses: Array<{
      idx: number;
      whyRelevant: string;
      commentStrategy: string;
      suggestedComment: string;
    }> = JSON.parse(analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());

    // Map to LinkedInPost objects
    const posts: LinkedInPost[] = filteredPosts.slice(0, 15).map((item, i) => {
      const p = item.post;
      const analysis = analyses.find((a) => a.idx === i);
      return {
        id: `lp-${i}-${Date.now()}`,
        authorName: p.authorName,
        authorTitle: p.authorTitle,
        authorCompany: p.authorCompany,
        authorLinkedinUrl: p.authorLinkedinUrl,
        postContent: p.content,
        postDate: p.date,
        postUrl: p.postUrl,
        likes: p.likes,
        comments: p.comments,
        whyRelevant: analysis?.whyRelevant || "Relevant to your product space",
        commentStrategy: analysis?.commentStrategy || "Engage with a thoughtful comment",
        suggestedComment: analysis?.suggestedComment || "",
        relevanceScore: item.score,
      };
    });

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-posts] Error:", err.message);
    return NextResponse.json({ posts: [], _error: err.message }, { status: 200 });
  }
}
