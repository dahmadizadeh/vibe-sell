import Anthropic from "@anthropic-ai/sdk";
import type { Targeting } from "./types";
import { generateSlug } from "./utils";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const APP_PROMPT = (description: string) => `You are a senior React developer building a working prototype. A user described this app:

"${description}"

Build a COMPLETE, WORKING React app prototype. This is the most important thing: the app must actually render and be interactive.

REQUIREMENTS:
1. Single function component named "App" — no other top-level components
2. Inline all helper components INSIDE the App function or define them in the same scope above App
3. Use React.useState for state (NOT bare "useState")
4. Use React.useEffect if needed (NOT bare "useEffect")
5. Use ONLY inline styles as JavaScript objects — no CSS classes, no Tailwind, no external stylesheets
6. NO import statements of any kind
7. NO export statements of any kind
8. The function should just be: function App() { ... }
9. Include realistic mock data relevant to the user's idea
10. Make it interactive — tabs, buttons, toggles, navigation between views
11. Include at least 3 different views/screens
12. Make it look like a real app — proper spacing, colors, typography
13. Use emoji and unicode characters for icons instead of external icon libraries

EXAMPLE STRUCTURE:
function App() {
  var [currentView, setCurrentView] = React.useState('home');
  var [likes, setLikes] = React.useState([]);

  var profiles = [
    { id: 1, name: 'Sara', age: 28, bio: 'Love hiking and cooking' },
    { id: 2, name: 'Ali', age: 31, bio: 'Software engineer, coffee addict' },
  ];

  if (currentView === 'matches') {
    return React.createElement('div', { style: { padding: 20 } },
      React.createElement('h2', null, 'Your Matches')
    );
  }

  return React.createElement('div', { style: { maxWidth: 400, margin: '0 auto' } },
    React.createElement('h1', null, 'My App')
  );
}

You may use JSX syntax — it will be transpiled. So this is fine:
function App() {
  const [view, setView] = React.useState('home');
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>My App</h1>
    </div>
  );
}

For the specific idea "${description}", build something that:
- Looks and feels like a real version of that app
- Has realistic sample data matching the idea
- Is immediately impressive when someone sees it
- Includes proper mobile-app-like styling (max-width 420px, centered, rounded cards, etc)

Return ONLY valid JSON with this exact structure (no markdown fences, no explanation):
{
  "name": "App Name",
  "tagline": "One line tagline",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "reactCode": "<the complete function App() { ... } code>"
}

CRITICAL: The reactCode must be valid JSX that can be transpiled by Babel. No import statements. No export statements. Just the function.`;

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
