import { NextRequest } from "next/server";
import { generateAppCodeStream } from "@/lib/v0";
import type { AppGenerationContext } from "@/lib/v0";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const { description, context } = (await req.json()) as {
    description: string;
    context?: Partial<AppGenerationContext>;
  };

  const fullContext: AppGenerationContext = {
    description,
    ...context,
  };

  console.log("[stream-app-v0] Starting stream for:", description.slice(0, 80));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let totalChunks = 0;
        for await (const chunk of generateAppCodeStream(fullContext)) {
          totalChunks++;
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        console.log("[stream-app-v0] Stream complete. Total chunks:", totalChunks);
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[stream-app-v0] Stream error:", msg);
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
