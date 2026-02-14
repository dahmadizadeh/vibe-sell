import Anthropic from "@anthropic-ai/sdk";
import type { ConversationAnalysis, Conversation, PMFScore } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeConversation(
  transcript: string,
  appName: string,
  description: string
): Promise<ConversationAnalysis> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a customer discovery expert analyzing a conversation transcript. Be brutally honest — only extract what was ACTUALLY SAID, don't infer or be optimistic.

Product: "${appName}" — ${description}

Transcript:
"""
${transcript}
"""

Analyze this conversation and extract:

1. KEY INSIGHTS: Array of observations. Each has a "signal" (positive, neutral, negative, or idea) and "text". Focus on what the person actually said or implied.
2. OVERALL SENTIMENT: How excited/interested was this person? (strong_positive, positive, neutral, negative, strong_negative)
3. WILLINGNESS TO PAY: What did they say about paying? Quote or summarize.
4. CURRENT SOLUTION: What are they using today to solve this problem?
5. SWITCHING TRIGGER: What would make them switch to your product?
6. FEATURE REQUESTS: Specific features they mentioned wanting.
7. BEST QUOTE: The single most insightful thing they said (exact quote if possible).

Return ONLY valid JSON:
{
  "keyInsights": [{"signal": "positive", "text": "..."}],
  "overallSentiment": "positive",
  "willingnessToPay": "...",
  "currentSolution": "...",
  "switchingTrigger": "...",
  "featureRequests": ["..."],
  "bestQuote": "..."
}

No markdown. No explanation. Just JSON.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function calculatePMFScore(
  conversations: Conversation[],
  appName: string,
  description: string
): Promise<PMFScore> {
  const summaries = conversations.map((c, i) => ({
    number: i + 1,
    sentiment: c.analysis.overallSentiment,
    willingnessToPay: c.analysis.willingnessToPay,
    currentSolution: c.analysis.currentSolution,
    featureRequests: c.analysis.featureRequests,
    bestQuote: c.analysis.bestQuote,
    keyInsights: c.analysis.keyInsights.map((k) => `[${k.signal}] ${k.text}`),
  }));

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a YC partner evaluating product-market fit based on real customer conversations.

Product: "${appName}" — ${description}

Conversation summaries:
${JSON.stringify(summaries, null, 2)}

Score this product across 4 dimensions (0-100 each):

1. PROBLEM VALIDATION: Do people actually have this problem? Are they actively trying to solve it?
2. SOLUTION INTEREST: Did people get excited about this specific solution? Did they ask for access?
3. WILLINGNESS TO PAY: Would they pay for this? How much?
4. REFERRAL POTENTIAL: Did anyone say they'd tell others about it?

Also provide:
- Overall score (weighted average)
- A 2-sentence summary of where this product stands
- The biggest risk based on these conversations
- The single most important next action

Return ONLY valid JSON:
{
  "overall": 62,
  "dimensions": {
    "problemValidation": 75,
    "solutionInterest": 60,
    "willingnessToPay": 45,
    "referralPotential": 50
  },
  "conversationCount": ${conversations.length},
  "summary": "...",
  "biggestRisk": "...",
  "suggestedAction": "..."
}

No markdown. No explanation. Just JSON.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function generateSuggestedQuestions(
  appName: string,
  description: string
): Promise<string[]> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a customer discovery coach. Generate 5 Mom Test-style questions for someone building this product.

Product: "${appName}" — ${description}

Rules:
- Questions should be about the person's LIFE and BEHAVIOR, not about the product
- Never ask "would you use this?" or "would you pay for this?" — those are useless
- Ask about their current workflow, pain points, and what they've tried before
- Each question should uncover a specific insight about product-market fit
- Make questions specific to THIS product idea, not generic

Return ONLY a JSON array of 5 strings:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]

No markdown. No explanation. Just JSON.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}
