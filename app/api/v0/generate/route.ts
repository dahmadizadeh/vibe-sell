import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.V0_API_KEY) {
    console.error("[v0] V0_API_KEY is not configured");
    return NextResponse.json(
      { error: "V0_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const { prompt, existingCode } = await req.json();

  const isEdit = !!existingCode;

  const systemPrompt = isEdit
    ? `You are editing an existing React application. The user will provide the current code and their edit request. Return the COMPLETE updated React component — not a diff, not partial code. Maintain all existing functionality unless told to remove it. Use Tailwind CSS. Use only React hooks (useState, useEffect, useMemo, useCallback, useRef). No external imports besides React.`
    : `Generate a fully functional, interactive single-page React application.

CRITICAL: This must be a WORKING APP, not a landing page or marketing site. It should have:
- Interactive UI with useState for state management
- Real sample/mock data hardcoded in the component
- Click handlers, toggles, filters, or other interactions
- Multiple views or sections the user can navigate
- A polished, modern design using Tailwind CSS

Output ONLY the React component code. No markdown, no explanation, no code fences. Just the raw JSX/TSX code.

The component should be a default export named App:
export default function App() { ... }

Use only React hooks. No external package imports. No Next.js router. No fetch calls to external APIs. Everything self-contained.`;

  const userMessage = isEdit
    ? `Here is the current app code:\n\n${existingCode}\n\nEdit request: ${prompt}\n\nReturn the COMPLETE updated code.`
    : `Build this app: ${prompt}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  console.log("[v0] Request:", {
    url: "https://api.v0.dev/v1/chat/completions",
    model: "v0-1.5-md",
    hasApiKey: !!process.env.V0_API_KEY,
    keyPrefix: process.env.V0_API_KEY?.substring(0, 8) + "...",
    messageCount: messages.length,
    isEdit,
    promptLength: prompt?.length,
  });

  try {
    const res = await fetch("https://api.v0.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.V0_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "v0-1.5-md",
        stream: false,
        messages,
        max_completion_tokens: 32000,
      }),
    });

    // Always read as text first so we can log the full response
    const rawText = await res.text();
    console.log("[v0] Raw response status:", res.status);
    console.log("[v0] Raw response body:", rawText.slice(0, 1000));

    if (!res.ok) {
      console.error("[v0] API error:", res.status, rawText);
      return NextResponse.json(
        { error: `v0 error (${res.status}): ${rawText.slice(0, 500)}` },
        { status: res.status }
      );
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[v0] Failed to parse JSON. Raw text:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: `v0 returned non-JSON: ${rawText.slice(0, 300)}` },
        { status: 500 }
      );
    }

    const generatedCode = data.choices?.[0]?.message?.content || "";

    if (!generatedCode) {
      console.error("[v0] Empty response from API. Full response:", rawText.slice(0, 500));
      return NextResponse.json(
        { error: "v0 returned an empty response" },
        { status: 500 }
      );
    }

    // Strip markdown code fences if present
    const cleanCode = generatedCode
      .replace(/^```(?:tsx|jsx|javascript|js|react)?\s*\n?/gm, "")
      .replace(/```\s*$/gm, "")
      .trim();

    console.log("[v0] Generated code length:", cleanCode.length);

    return NextResponse.json({ code: cleanCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[v0] Fetch error:", message);
    return NextResponse.json(
      { error: `v0 request failed: ${message}` },
      { status: 500 }
    );
  }
}
