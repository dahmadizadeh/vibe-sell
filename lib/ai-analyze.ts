import Anthropic from "@anthropic-ai/sdk";
import type { Targeting, ViabilityAnalysis, AudienceGroup } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeBusinessViability(
  description: string,
  appName: string
): Promise<ViabilityAnalysis> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a YC partner evaluating a startup idea. Be honest and specific — not generic cheerleading.

The idea: "${description}"
App name: "${appName}"

Analyze this across 5 dimensions (score each 1-100):

1. MARKET DEMAND: Is there real demand? How many people want this? Are people actively searching for it?
2. COMPETITION: Who else does this? Name specific real competitors. Are they well-funded? What's the moat?
3. MONETIZATION: Can this make money? What pricing models work? What's the realistic TAM?
4. FEASIBILITY: How hard is this to build for real? What are the technical challenges?
5. TIMING: Why now? Is there a trend making this possible/necessary today?

Also provide:
- An overall score (weighted average, market demand counts 2x)
- A verdict: "Strong" (75+), "Promising" (55-74), "Needs Work" (35-54), "Risky" (<35)
- A 2-3 sentence summary a YC partner would actually say in an interview
- Top 3 risks
- Top 3 opportunities
- For competition: name 3-5 REAL competitors (real companies/apps that exist)

Return ONLY valid JSON matching this structure:
{
  "overallScore": 72,
  "verdict": "Promising",
  "dimensions": {
    "marketDemand": { "score": 65, "reasoning": "..." },
    "competition": { "score": 70, "reasoning": "...", "competitors": [{"name": "...", "description": "...", "funding": "...", "url": "..."}] },
    "monetization": { "score": 75, "reasoning": "...", "suggestedModels": ["Freemium", "Premium $9.99/mo"] },
    "feasibility": { "score": 80, "reasoning": "..." },
    "timing": { "score": 68, "reasoning": "..." }
  },
  "summary": "...",
  "topRisks": ["...", "...", "..."],
  "topOpportunities": ["...", "...", "..."]
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

export async function generateSmartTargeting(
  description: string,
  appName: string
): Promise<{
  targeting: Targeting;
  audienceGroups: AudienceGroup[];
}> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are helping a founder find the right people to reach out to for their new product.

The idea: "${description}"
App name: "${appName}"

Think about WHO would be most useful for this founder to talk to right now. Not generic B2B buyers — the actual people relevant to THIS specific idea.

Generate 3-4 audience groups. Each group should have:
- A name (e.g., "Early Adopters", "Domain Experts", "Potential Investors", "Community Leaders")
- A description of why this group matters
- Specific job titles, industries, and keywords to search for these people
- A search strategy: what filters would find them

For example, for a "Farsi dating app":
- Group 1: "Farsi-Speaking Professionals" — young Farsi speakers in US/UK/Canada who might be early users
- Group 2: "Dating App Veterans" — people who've worked at Hinge, Bumble, Tinder who could advise
- Group 3: "Community Builders" — Farsi podcasters, content creators, community organizers
- Group 4: "Social/Dating Investors" — VCs who've invested in dating or social apps

Return ONLY valid JSON:
{
  "targeting": {
    "industries": ["array of all relevant industries across groups"],
    "companySize": { "min": 1, "max": 10000 },
    "titles": ["array of all relevant titles across groups"],
    "regions": ["United States", "United Kingdom", "Canada"],
    "summary": "A plain English description of who we're looking for"
  },
  "audienceGroups": [
    {
      "id": "early-adopters",
      "name": "Early Adopters",
      "description": "Why this group matters for this specific idea",
      "icon": "users",
      "searchFilters": {
        "titles": ["specific titles to search"],
        "industries": ["specific industries"],
        "keywords": ["optional keywords"],
        "companies": ["optional specific company names"],
        "regions": ["United States"]
      },
      "count": 25
    }
  ]
}

Generate 3-4 groups. Counts should sum to about 100. No markdown. Just JSON.`,
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
