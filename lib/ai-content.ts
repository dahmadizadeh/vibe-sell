import Anthropic from "@anthropic-ai/sdk";
import type {
  AudienceGroup,
  Contact,
  EmailDraft,
  PostTemplate,
  ProjectGoal,
  ViabilityAnalysis,
} from "./types";
import { getGoalContext } from "./ai-analyze";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generatePosts(
  description: string,
  appName: string,
  audienceGroups: AudienceGroup[],
  viability: ViabilityAnalysis | undefined,
  projectGoal?: ProjectGoal
): Promise<PostTemplate[]> {
  const groupNames = audienceGroups.map((g) => g.name).join(", ");
  const viabilitySummary = viability?.summary || "Early-stage product.";
  const goalContext = getGoalContext(projectGoal);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a startup founder who's great at social media. Generate 4 post templates for launching this product:

Product: "${appName}" — ${description}${goalContext}
Key insight from analysis: ${viabilitySummary}
Target audience groups: ${groupNames}

Generate 4 posts for different platforms and purposes:

1. LINKEDIN LAUNCH POST — Announce the product to your professional network. Tell the story of why you built it. Include a hook, the problem, the solution, a CTA. 200-300 words.

2. TWITTER/X THREAD — A punchy 5-tweet thread announcing the product. First tweet is the hook. Include one tweet about the problem, one about the solution, one with a screenshot/demo mention, one CTA.

3. COMMUNITY POST — A post for a relevant community (Reddit, Discord, Facebook group). More casual, asking for feedback, being transparent about being early stage. Identify the SPECIFIC community to post in.

4. COLD DM TEMPLATE — A short LinkedIn/Twitter DM to send to potential users or advisors. 2-3 sentences max. Personal, not salesy.

For each, consider the SPECIFIC audience. Write in first person as the founder. Make each post feel authentic and specific to this exact product — not generic startup advice.

Return ONLY valid JSON array:
[
  {
    "id": "linkedin-launch",
    "platform": "LinkedIn",
    "purpose": "Launch Announcement",
    "title": "LinkedIn Launch Post",
    "content": "the full post text...",
    "targetAudience": "who this targets...",
    "bestTimeToPost": "Tuesday-Thursday, 8-10am",
    "expectedReach": "500-2000 impressions",
    "communityName": null
  },
  {
    "id": "twitter-thread",
    "platform": "Twitter/X",
    "purpose": "Launch Thread",
    "title": "Launch Thread",
    "content": "Tweet 1: ...\\n\\nTweet 2: ...\\n\\nTweet 3: ...\\n\\nTweet 4: ...\\n\\nTweet 5: ...",
    "targetAudience": "...",
    "bestTimeToPost": "...",
    "expectedReach": "...",
    "communityName": null
  },
  {
    "id": "community",
    "platform": "Reddit",
    "purpose": "Feedback Request",
    "title": "Post to r/...",
    "content": "...",
    "targetAudience": "...",
    "bestTimeToPost": "...",
    "expectedReach": "...",
    "communityName": "r/SomeSubreddit"
  },
  {
    "id": "cold-dm",
    "platform": "LinkedIn DM",
    "purpose": "Direct Outreach",
    "title": "Cold DM Template",
    "content": "...",
    "targetAudience": "...",
    "bestTimeToPost": "Any",
    "expectedReach": "30-40% reply rate",
    "communityName": null
  }
]

No markdown fences. No explanation. Just the JSON array.`,
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

export async function generateContextualEmails(
  contacts: Contact[],
  audienceGroups: AudienceGroup[],
  appName: string,
  description: string,
  shareUrl: string,
  projectGoal?: ProjectGoal
): Promise<EmailDraft[]> {
  // Build contact-to-group mapping
  const contactGroupMap: Record<string, string> = {};
  for (const group of audienceGroups) {
    for (const c of group.contacts || []) {
      contactGroupMap[c.id] = group.name;
    }
  }

  // Take up to 6 contacts for email generation (to keep token usage reasonable)
  const selectedContacts = contacts.slice(0, 6);
  const contactDescriptions = selectedContacts.map((c) => ({
    id: c.id,
    name: c.firstName,
    title: c.title,
    company: c.company,
    group: contactGroupMap[c.id] || "General",
    matchReason: c.matchReason,
  }));

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are helping a founder write personalized cold emails for their product.

Product: "${appName}" — ${description}${getGoalContext(projectGoal)}
Demo link: ${shareUrl}

Write a personalized email for each of these contacts. The tone depends on their group:
- For "Early Adopters" / users: Ask them to try the product and give feedback
- For "Advisors" / veterans: Ask for 15 min of their time to learn from their experience
- For "Investors": Share what you're building and traction signals
- For "Community Leaders": Ask if they'd check it out and share with their audience

Contacts:
${JSON.stringify(contactDescriptions, null, 2)}

Return ONLY a JSON array:
[
  {
    "contactId": "...",
    "subject": "short email subject",
    "body": "the email body, 3-5 sentences max, first-person, casual but professional",
    "mode": "builder"
  }
]

No markdown. Just JSON array.`,
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
