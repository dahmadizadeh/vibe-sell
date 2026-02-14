import { NextRequest, NextResponse } from "next/server";
import type { ProjectMode, Contact } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { mode, context, contacts } = (await req.json()) as {
    mode: ProjectMode;
    context: { description: string; shareUrl: string };
    contacts: Contact[];
  };

  // TODO: Replace with real Claude API call
  // Generate personalized emails for each contact
  //
  // for (const contact of contacts) {
  //   const response = await anthropic.messages.create({
  //     model: "claude-sonnet-4-20250514",
  //     max_tokens: 512,
  //     messages: [{
  //       role: "user",
  //       content: mode === "builder"
  //         ? `Write a cold outreach email (5-6 sentences).
  //            Target: ${contact.name}, ${contact.title} at ${contact.company}
  //            Match reason: ${contact.matchReason}
  //            Product: ${context.description}
  //            Link: vibesell.app${context.shareUrl}
  //            Requirements: Reference their signal, explain value, include link, CTA for 15-min call.
  //            Return JSON: { subject: string, body: string }`
  //         : `Write a direct pitch email (3-4 sentences).
  //            Target: ${contact.name}, ${contact.title} at ${contact.company}
  //            Pitch page link: vibesell.app${context.shareUrl}
  //            Requirements: Reference their role, mention the pitch page, CTA for 15-min look.
  //            Return JSON: { subject: string, body: string }`
  //     }]
  //   });
  // }

  void mode;
  void context;
  void contacts;

  return NextResponse.json({
    success: true,
    message: "Email generation will use Claude API in production",
  });
}
