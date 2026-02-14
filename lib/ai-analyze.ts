import Anthropic from "@anthropic-ai/sdk";
import type { Targeting, ViabilityAnalysis, AudienceGroup, ProjectGoal } from "./types";

export function getGoalContext(projectGoal?: ProjectGoal): string {
  if (!projectGoal) return "";
  const contexts: Record<ProjectGoal, string> = {
    side_project: `\n\nIMPORTANT CONTEXT: The founder's goal is SIDE PROJECT.
- Weight feasibility and speed-to-market highest. Be encouraging about small experiments. Don't penalize for small market size.
- Find early adopters, beta testers, community members. Focus on people who try new tools.
- Suggest low-cost, fast experiments (Product Hunt, Reddit, Indie Hackers, Twitter, free communities).
- Tailor match reasons: "Would be a great beta tester because..."`,
    small_business: `\n\nIMPORTANT CONTEXT: The founder's goal is SMALL BUSINESS (profitability-focused).
- Weight monetization and sustainable unit economics highest. Focus on profitability, not growth rate.
- Find paying customers and distribution partners. Focus on people with budget authority.
- Suggest profitable channels (Google Ads, cold email, partnerships, SEO, referrals).
- Tailor match reasons: "Could be a paying customer because..."`,
    venture_scale: `\n\nIMPORTANT CONTEXT: The founder's goal is VENTURE SCALE.
- Weight market size, timing, and defensibility highest. Evaluate for VC fundability.
- Find design partners, enterprise champions, and lighthouse accounts. Focus on people at companies that could become case studies.
- Suggest enterprise channels (warm intros, accelerator networks, thought leadership, conference dinners, design partner programs).
- Tailor match reasons: "Could be a design partner because..."`,
  };
  return contexts[projectGoal];
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeBusinessViability(
  description: string,
  appName: string,
  projectGoal?: ProjectGoal
): Promise<ViabilityAnalysis> {
  const goalContext = getGoalContext(projectGoal);
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a YC partner evaluating a startup idea. Be honest and specific — not generic cheerleading.

The idea: "${description}"
App name: "${appName}"${goalContext}

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
  appName: string,
  projectGoal?: ProjectGoal
): Promise<{
  targeting: Targeting;
  audienceGroups: AudienceGroup[];
}> {
  const goalContext = getGoalContext(projectGoal);
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are generating search filters to find real people for a startup using the Crustdata person database.

The product: "${appName}" — ${description}${goalContext}

Generate 3-4 audience groups of people who would be potential USERS, CUSTOMERS, or VALUABLE CONTACTS for this product.

For EACH group, generate Crustdata person search filter conditions. Available filter columns:
- "current_employers.title" (type: "(.)" for fuzzy match) — job titles
- "current_employers.company_name" (type: "(.)" for fuzzy match) — specific company names
- "current_employers.company_industries" (type: "in" for list match) — industry list (use real LinkedIn industry names)
- "current_employers.seniority_level" (type: "in") — values: "CXO", "Vice President", "Director", "Manager", "Senior", "Lead", "Entry"
- "current_employers.company_headcount_latest" (type: "=>") — minimum headcount (number)
- "current_employers.company_headcount_latest" (type: "=<") — maximum headcount (number)
- "region" (type: "(.)" for fuzzy match) — geographic region

To search for multiple titles, use an OR block:
{ "op": "or", "conditions": [{ "column": "current_employers.title", "type": "(.)", "value": "founder" }, { "column": "current_employers.title", "type": "(.)", "value": "CEO" }] }

CRITICAL RULES:
1. Each group's filters must be DIFFERENT and SPECIFIC to that audience segment
2. DO NOT use generic seniority-only filters — combine title + industry + company size
3. If the product targets founders/startups, search for "founder" OR "co-founder" OR "CEO" at companies with headcount <= 50
4. If the product targets a specific niche, use industry-specific titles and company names of competitors
5. Use company name filters for well-known companies in the space when relevant
6. The matchReasonTemplate must explain WHY this person matters for THIS product — use {title}, {company}, {headcount}, {industry} as placeholders

Return ONLY valid JSON:
{
  "targeting": {
    "industries": ["all relevant industries combined"],
    "companySize": { "min": 1, "max": 10000 },
    "titles": ["all relevant titles combined"],
    "regions": ["United States"],
    "summary": "Plain English description of who we're looking for"
  },
  "audienceGroups": [
    {
      "id": "kebab-case-id",
      "name": "Group Name",
      "description": "Why these people matter for this specific product",
      "icon": "users",
      "searchFilters": {
        "titles": ["title1", "title2"],
        "industries": ["Industry Name"],
        "companies": ["optional company names"],
        "regions": ["United States"]
      },
      "crustdataConditions": [
        { "op": "or", "conditions": [
          { "column": "current_employers.title", "type": "(.)", "value": "specific title" },
          { "column": "current_employers.title", "type": "(.)", "value": "another title" }
        ]},
        { "column": "current_employers.company_industries", "type": "in", "value": ["Specific Industry"] },
        { "column": "current_employers.company_headcount_latest", "type": "=<", "value": 50 }
      ],
      "matchReasonTemplate": "{title} at {company} ({headcount} employees) — specific reason why they matter for ${appName}",
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
