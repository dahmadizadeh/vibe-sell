import { NextRequest } from "next/server";
import { generateAppStream } from "@/lib/ai";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { description } = (await req.json()) as { description: string };

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generateAppStream(description)) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      } catch (err) {
        console.error("[stream-app] Stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
