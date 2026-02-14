import Anthropic from "@anthropic-ai/sdk";
import type { Targeting } from "./types";
import { generateSlug } from "./utils";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const APP_PROMPT = (description: string) => `You are a product designer and React developer. A user described this app idea:

"${description}"

Generate:
1. A short, catchy app name (2-3 words max)
2. A one-line tagline
3. 3 key features (one line each)
4. A COMPLETE working React component that serves as a demo/prototype of this app. The component should:
   - Be a single self-contained React functional component named App with default export
   - Use only inline styles (no Tailwind, no external CSS)
   - Include realistic mock data that matches the user's idea
   - Be interactive (clickable tabs, buttons that toggle state, etc.)
   - Look like a real app, not a wireframe
   - Include at least 3 screens/views accessible via tabs or navigation
   - Use React.useState for interactivity (use React.useState, not destructured useState)
   - Do NOT use import statements — React is available as a global
   - Do NOT use JSX fragments (<>...</>) — use <div> wrappers instead

For example, if the user says "dating app for Farsi speakers", build an actual dating app UI with:
- Profile cards with Farsi names and bios
- Swipe/like/pass buttons
- A matches view
- A chat preview
- Cultural elements in the design

Return ONLY valid JSON with this exact structure:
{
  "name": "App Name",
  "tagline": "One line tagline",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "reactCode": "function App() { ... }\\nexport default App;"
}

CRITICAL: The reactCode value must be a valid JSON string (escape all newlines as \\n, escape all quotes). No markdown fences. No explanation. Just the JSON object.`;

export async function generateApp(description: string): Promise<{
  name: string;
  tagline: string;
  features: string[];
  reactCode: string;
}> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: APP_PROMPT(description) }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseAppResponse(text);
}

/**
 * Streaming version of generateApp. Yields raw text chunks as they arrive.
 * Call parseAppResponse() on the accumulated text when done.
 */
export async function* generateAppStream(
  description: string
): AsyncGenerator<string, void, unknown> {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: APP_PROMPT(description) }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

export function parseAppResponse(text: string): {
  name: string;
  tagline: string;
  features: string[];
  reactCode: string;
} {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function generateTargeting(
  description: string,
  appName: string
): Promise<Targeting> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a go-to-market strategist. A user built a product called "${appName}" described as:

"${description}"

Generate a targeting profile for finding the first 100 potential customers. Return ONLY valid JSON:
{
  "industries": ["Industry 1", "Industry 2", "Industry 3"],
  "companySize": { "min": 50, "max": 500 },
  "titles": ["Title 1", "Title 2", "Title 3", "Title 4"],
  "regions": ["United States"],
  "summary": "One sentence describing the ideal customer"
}

The industries should be real LinkedIn industry categories.
The titles should be real job titles of people who would BUY or CHAMPION this product.
Be specific to the actual product idea — not generic B2B titles.

No markdown fences. No explanation. Just the JSON.`,
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

export function slugify(name: string): string {
  return generateSlug(name);
}
