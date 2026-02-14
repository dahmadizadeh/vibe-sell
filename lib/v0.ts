export interface LandingPageContext {
  description: string;
  appName?: string;
  tagline?: string;
  features?: string[];
  targetUser?: string;
  problemSolved?: string;
  industry?: string;
  competitors?: string[];
  viabilityScore?: number;
  viabilitySummary?: string;
  topOpportunities?: string[];
  projectGoal?: string;
  founders?: { name: string; headline?: string }[];
}

export interface LandingPageResult {
  code: string;
  name: string;
  tagline: string;
  features: string[];
}

function buildMessages(context: LandingPageContext): { role: "system" | "user"; content: string }[] {
  const systemPrompt = `You are an expert landing page designer. You generate complete, beautiful React landing pages using Tailwind CSS classes. You produce a single \`function App()\` component with NO imports, NO exports, using JSX syntax with Tailwind classes. Use React.useState if needed. The component should be self-contained and render a professional landing page.`;

  const contextParts: string[] = [];
  if (context.appName) contextParts.push(`Product name: ${context.appName}`);
  if (context.tagline) contextParts.push(`Tagline: ${context.tagline}`);
  if (context.description) contextParts.push(`Description: ${context.description}`);
  if (context.targetUser) contextParts.push(`Target user: ${context.targetUser}`);
  if (context.problemSolved) contextParts.push(`Problem solved: ${context.problemSolved}`);
  if (context.industry) contextParts.push(`Industry: ${context.industry}`);
  if (context.features && context.features.length > 0) contextParts.push(`Key features: ${context.features.join(", ")}`);
  if (context.competitors && context.competitors.length > 0) contextParts.push(`Competitors: ${context.competitors.join(", ")}`);
  if (context.viabilityScore !== undefined) contextParts.push(`Viability score: ${context.viabilityScore}/100`);
  if (context.viabilitySummary) contextParts.push(`Business analysis: ${context.viabilitySummary}`);
  if (context.topOpportunities && context.topOpportunities.length > 0) contextParts.push(`Top opportunities: ${context.topOpportunities.join("; ")}`);
  if (context.projectGoal) contextParts.push(`Project goal: ${context.projectGoal}`);
  if (context.founders && context.founders.length > 0) {
    const founderList = context.founders.map((f) => f.headline ? `${f.name} (${f.headline})` : f.name).join(", ");
    contextParts.push(`Founders: ${founderList}`);
  }

  const userPrompt = `Generate a complete landing page for this product:

${contextParts.join("\n")}

The landing page MUST include:
1. A hero section with the product name, a compelling one-liner headline, and a brief description
2. 3 value proposition cards highlighting key benefits (use the features/opportunities from the analysis)
3. A "How it compares" or competitor comparison section (if competitors are provided)
4. A waitlist/early access email capture form with an email input and submit button
5. A clean footer with the product name

CRITICAL RULES:
- Output ONLY a single \`function App()\` component using JSX with Tailwind CSS classes
- NO import statements, NO export statements
- Use React.useState for any state (like the email input)
- Use beautiful, modern styling — gradients, rounded corners, shadows, proper spacing
- Use emoji or unicode for icons (no icon libraries)
- The design should look professional and polished
- Make the waitlist form functional (with state for the email input and a submitted state)
- Use a cohesive color scheme (prefer indigo/violet gradients for the hero)

Return ONLY valid JSON with this exact structure (no markdown fences, no explanation):
{
  "name": "${context.appName || "ProductName"}",
  "tagline": "One line tagline",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "code": "<the complete function App() { ... } JSX code>"
}`;

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
}

function parseResponse(text: string): LandingPageResult {
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    console.log("[v0/parseResponse] Parsed OK. name=", parsed.name, "code length=", parsed.code?.length || 0);
    if (!parsed.code) {
      console.error("[v0/parseResponse] WARNING: No code in response!");
    }
    return {
      code: parsed.code || "",
      name: parsed.name || "My App",
      tagline: parsed.tagline || "",
      features: parsed.features || [],
    };
  } catch (err) {
    console.error("[v0/parseResponse] JSON parse failed. Text length:", cleaned.length);
    console.error("[v0/parseResponse] First 200 chars:", cleaned.slice(0, 200));
    console.error("[v0/parseResponse] Last 200 chars:", cleaned.slice(-200));
    throw err;
  }
}

export async function generateLandingPage(context: LandingPageContext): Promise<LandingPageResult> {
  const messages = buildMessages(context);
  console.log("[v0/generateLandingPage] Starting. model=v0-1.5-md, max_tokens=16000");

  const response = await fetch("https://api.v0.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.V0_API_KEY}`,
    },
    body: JSON.stringify({
      model: "v0-1.5-md",
      max_tokens: 16000,
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[v0/generateLandingPage] API error:", response.status, errorBody.slice(0, 500));
    throw new Error(`v0 API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  console.log("[v0/generateLandingPage] Response text length:", text.length);

  return parseResponse(text);
}

export async function* generateLandingPageStream(
  context: LandingPageContext
): AsyncGenerator<string, void, unknown> {
  const messages = buildMessages(context);
  console.log("[v0/generateLandingPageStream] Starting. model=v0-1.5-md, max_tokens=16000");

  const response = await fetch("https://api.v0.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.V0_API_KEY}`,
    },
    body: JSON.stringify({
      model: "v0-1.5-md",
      max_tokens: 16000,
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[v0/generateLandingPageStream] API error:", response.status, errorBody.slice(0, 500));
    throw new Error(`v0 API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let totalChars = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    // Keep the last incomplete line in the buffer
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const jsonStr = trimmed.slice(6);
      if (jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          totalChars += content.length;
          yield content;
        }
      } catch {
        // Skip malformed SSE lines
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim()) {
    const trimmed = buffer.trim();
    if (trimmed.startsWith("data: ") && trimmed.slice(6) !== "[DONE]") {
      try {
        const parsed = JSON.parse(trimmed.slice(6));
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          totalChars += content.length;
          yield content;
        }
      } catch {
        // Skip
      }
    }
  }

  console.log("[v0/generateLandingPageStream] Stream done. total_chars=", totalChars);
}

export { parseResponse as parseLandingPageResponse };

// --- App Generation (functional app, not landing page) ---

export interface AppGenerationContext {
  description: string;
  appName?: string;
  features?: string[];
  targetUser?: string;
  industry?: string;
  projectGoal?: string;
}

export interface AppEditMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function buildAppSystemPrompt(): string {
  return `You are an expert React app builder. You generate complete, interactive, FUNCTIONAL single-page React applications — NOT marketing landing pages.

CRITICAL RULES:
- Build a WORKING application with real UI interactions, state management, navigation, and sample data
- Output ONLY a single \`function App()\` component — no imports, no exports
- Use React.useState, React.useEffect, React.useRef, React.useCallback, React.useMemo (fully qualified with React. prefix)
- Use Tailwind CSS classes for all styling
- Use emoji/unicode for icons (no icon libraries)
- Include multiple views/screens using tabs, sidebar navigation, or route-like state
- Include realistic sample data baked into the component
- Include working forms, buttons, search, filters, modals — all functional
- Make it look professional and polished with proper spacing, colors, and typography
- Do NOT build a landing page, marketing page, or waitlist page
- Do NOT use import or export statements
- Return ONLY the raw code — no markdown fences, no explanation, no JSON wrapper`;
}

function buildAppEditSystemPrompt(): string {
  return `You are editing an existing React app. Apply the requested changes carefully.

CRITICAL RULES:
- Return the COMPLETE updated \`function App()\` component — not a diff or partial code
- Preserve all existing functionality unless explicitly asked to remove it
- Use React.useState, React.useEffect etc. (fully qualified with React. prefix)
- Use Tailwind CSS classes for styling
- Use emoji/unicode for icons
- No imports, no exports
- Return ONLY the raw code — no markdown fences, no explanation, no JSON wrapper`;
}

export async function* generateAppCodeStream(
  context: AppGenerationContext
): AsyncGenerator<string, void, unknown> {
  const contextParts: string[] = [];
  if (context.appName) contextParts.push(`App name: ${context.appName}`);
  if (context.description) contextParts.push(`Description: ${context.description}`);
  if (context.targetUser) contextParts.push(`Target user: ${context.targetUser}`);
  if (context.industry) contextParts.push(`Industry: ${context.industry}`);
  if (context.features && context.features.length > 0) contextParts.push(`Key features: ${context.features.join(", ")}`);
  if (context.projectGoal) contextParts.push(`Project goal: ${context.projectGoal}`);

  const userPrompt = `Build a complete, functional React application for this product:\n\n${contextParts.join("\n")}\n\nRemember: This should be a WORKING app with real interactions, not a marketing page. Include sample data, multiple views, and working UI components.`;

  const messages = [
    { role: "system", content: buildAppSystemPrompt() },
    { role: "user", content: userPrompt },
  ];

  console.log("[v0/generateAppCodeStream] Starting. model=v0-1.5-md, max_tokens=32000");

  const response = await fetch("https://api.v0.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.V0_API_KEY}`,
    },
    body: JSON.stringify({
      model: "v0-1.5-md",
      max_tokens: 32000,
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[v0/generateAppCodeStream] API error:", response.status, errorBody.slice(0, 500));
    throw new Error(`v0 API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let totalChars = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const jsonStr = trimmed.slice(6);
      if (jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          totalChars += content.length;
          yield content;
        }
      } catch {
        // Skip malformed SSE lines
      }
    }
  }

  if (buffer.trim()) {
    const trimmed = buffer.trim();
    if (trimmed.startsWith("data: ") && trimmed.slice(6) !== "[DONE]") {
      try {
        const parsed = JSON.parse(trimmed.slice(6));
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          totalChars += content.length;
          yield content;
        }
      } catch {
        // Skip
      }
    }
  }

  console.log("[v0/generateAppCodeStream] Stream done. total_chars=", totalChars);
}

export async function* generateAppEditStream(
  currentCode: string,
  instruction: string,
  history?: AppEditMessage[]
): AsyncGenerator<string, void, unknown> {
  const messages: { role: string; content: string }[] = [
    { role: "system", content: buildAppEditSystemPrompt() },
  ];

  // Add up to 6 history turns for context
  if (history && history.length > 0) {
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      if (msg.role !== "system") {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  messages.push({
    role: "user",
    content: `Here is the current app code:\n\n\`\`\`jsx\n${currentCode}\n\`\`\`\n\nPlease make this change: ${instruction}\n\nReturn the COMPLETE updated component code.`,
  });

  console.log("[v0/generateAppEditStream] Starting. model=v0-1.5-md, max_tokens=32000, history_turns=", history?.length || 0);

  const response = await fetch("https://api.v0.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.V0_API_KEY}`,
    },
    body: JSON.stringify({
      model: "v0-1.5-md",
      max_tokens: 32000,
      stream: true,
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    console.error("[v0/generateAppEditStream] API error:", response.status, errorBody.slice(0, 500));
    throw new Error(`v0 API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";
  let totalChars = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const jsonStr = trimmed.slice(6);
      if (jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          totalChars += content.length;
          yield content;
        }
      } catch {
        // Skip malformed SSE lines
      }
    }
  }

  if (buffer.trim()) {
    const trimmed = buffer.trim();
    if (trimmed.startsWith("data: ") && trimmed.slice(6) !== "[DONE]") {
      try {
        const parsed = JSON.parse(trimmed.slice(6));
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          totalChars += content.length;
          yield content;
        }
      } catch {
        // Skip
      }
    }
  }

  console.log("[v0/generateAppEditStream] Stream done. total_chars=", totalChars);
}
