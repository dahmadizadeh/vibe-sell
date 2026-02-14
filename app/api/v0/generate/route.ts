import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
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

  try {
    const response = await fetch("https://api.v0.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.V0_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "v0-1.5-md",
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_completion_tokens: 32000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] API error:", response.status, errorText);
      return NextResponse.json(
        { error: `v0 API error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedCode = data.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    const cleanCode = generatedCode
      .replace(/^```(?:tsx|jsx|javascript|js|react)?\s*\n?/gm, "")
      .replace(/```\s*$/gm, "")
      .trim();

    console.log("[v0] Generated code length:", cleanCode.length);

    return NextResponse.json({ code: cleanCode });
  } catch (error) {
    console.error("[v0] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate app" },
      { status: 500 }
    );
  }
}
