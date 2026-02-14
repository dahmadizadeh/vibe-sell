import { NextRequest } from "next/server";
import { generateAppEditStream } from "@/lib/v0";
import type { AppEditMessage } from "@/lib/v0";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { currentCode, instruction, history } = (await req.json()) as {
    currentCode: string;
    instruction: string;
    history?: AppEditMessage[];
  };

  console.log("[edit-app] Starting edit stream. Instruction:", instruction.slice(0, 80));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let totalChunks = 0;
        for await (const chunk of generateAppEditStream(currentCode, instruction, history)) {
          totalChunks++;
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        console.log("[edit-app] Stream complete. Total chunks:", totalChunks);
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[edit-app] Stream error:", msg);
        controller.enqueue(new TextEncoder().encode(`\n\n__STREAM_ERROR__:${msg}`));
        controller.close();
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
