import { NextRequest, NextResponse } from "next/server";
import { searchLinkedInPosts } from "@/lib/crustdata";
import type { LinkedInPost } from "@/lib/types";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { description, appName, industry } = (await req.json()) as {
    description: string;
    appName: string;
    industry: string;
  };

  try {
    // Step 1: Generate search keywords from product description
    const keywordRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Generate 3-5 LinkedIn search keywords for finding posts relevant to "${appName}" in "${industry}": "${description}".

Return ONLY a JSON array of strings, e.g.: ["keyword1", "keyword2", "keyword3"]
No markdown fences. No explanation. Just the JSON array.`,
        },
      ],
    });

    const keywordText = keywordRes.content[0].type === "text" ? keywordRes.content[0].text : "[]";
    const keywords: string[] = JSON.parse(keywordText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());

    console.log("[find-posts] Generated keywords:", keywords);

    // Step 2: Search LinkedIn posts via Crustdata
    const rawPosts = await searchLinkedInPosts(keywords, 20);
    console.log("[find-posts] Found", rawPosts.length, "posts");

    if (rawPosts.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Step 3: Use Claude to analyze posts and generate engagement strategies
    const postsForAnalysis = rawPosts.slice(0, 15).map((p, i) => ({
      idx: i,
      author: p.authorName,
      title: p.authorTitle,
      company: p.authorCompany,
      content: p.content.slice(0, 500),
    }));

    const analysisRes = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are a LinkedIn engagement strategist. A founder built "${appName}": "${description}".

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

    // Map to LinkedInPost objects (rawPosts already filtered for valid content)
    const posts: LinkedInPost[] = rawPosts.slice(0, 15).map((p, i) => {
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
      };
    });

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[find-posts] Error:", err.message);
    return NextResponse.json({ posts: [], _error: err.message }, { status: 200 });
  }
}
