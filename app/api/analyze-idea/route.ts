import { NextRequest } from "next/server";
import { generateAppStream, parseAppResponse, generateTargeting, slugify } from "@/lib/ai";
import { detectBuilderScenario, getBuilderMockData } from "@/lib/mock-data";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { description } = (await req.json()) as { description: string };

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const send = async (event: string, data: unknown) => {
    await writer.write(
      encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    );
  };

  // Run async pipeline in background
  (async () => {
    try {
      await send("status", { step: "generating", message: "Building your app..." });

      // Stream the app code generation
      let fullText = "";
      for await (const chunk of generateAppStream(description)) {
        fullText += chunk;
        await send("code_chunk", { text: chunk });
      }

      // Parse the complete response
      const app = parseAppResponse(fullText);
      await send("app_ready", {
        name: app.name,
        tagline: app.tagline,
        features: app.features,
        reactCode: app.reactCode,
      });

      // Now generate targeting
      await send("status", { step: "targeting", message: "Finding your customers..." });
      const targeting = await generateTargeting(description, app.name);

      // Send final complete event
      await send("complete", {
        targeting,
        productPage: {
          name: app.name,
          tagline: app.tagline,
          features: app.features,
          shareUrl: `/p/${slugify(app.name)}`,
          reactCode: app.reactCode,
        },
      });
    } catch (error) {
      console.error("AI generation failed:", error);
      // Fall back to mock data
      const scenario = detectBuilderScenario(description);
      const data = getBuilderMockData(scenario);
      await send("complete", {
        targeting: data.targeting,
        productPage: data.productPage,
      });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
