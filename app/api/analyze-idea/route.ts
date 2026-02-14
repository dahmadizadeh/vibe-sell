import { NextRequest, NextResponse } from "next/server";
import { detectBuilderScenario, getBuilderMockData } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { description } = (await req.json()) as { description: string };

  // TODO: Replace with real Claude API call
  // const response = await anthropic.messages.create({
  //   model: "claude-sonnet-4-20250514",
  //   max_tokens: 1024,
  //   messages: [{
  //     role: "user",
  //     content: `Analyze this product description and generate:
  //       1. A targeting profile (industries, company sizes, buyer titles, regions)
  //       2. A product page (name, tagline, 3 features)
  //       Description: "${description}"
  //       Return JSON: { targeting: Targeting, productPage: ProductPage }`
  //   }]
  // });

  const scenario = detectBuilderScenario(description);
  const data = getBuilderMockData(scenario);

  return NextResponse.json({
    targeting: data.targeting,
    productPage: data.productPage,
  });
}
