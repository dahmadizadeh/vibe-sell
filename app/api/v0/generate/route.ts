import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

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
    model: "v0-1.5-md",
    stream: true,
    isEdit,
    promptLength: prompt?.length,
  });

  try {
    const v0Response = await fetch("https://api.v0.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.V0_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "v0-1.5-md",
        stream: true,
        messages,
        max_completion_tokens: 16000,
      }),
    });

    if (!v0Response.ok) {
      const errorText = await v0Response.text();
      console.error("[v0] API error:", v0Response.status, errorText);
      return NextResponse.json(
        { error: `v0 error (${v0Response.status}): ${errorText.slice(0, 500)}` },
        { status: v0Response.status }
      );
    }

    if (!v0Response.body) {
      return NextResponse.json(
        { error: "v0 returned no response body" },
        { status: 500 }
      );
    }

    // Pass the SSE stream directly through to the client
    return new Response(v0Response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[v0] Fetch error:", message);
    return NextResponse.json(
      { error: `v0 request failed: ${message}` },
      { status: 500 }
    );
  }
}
