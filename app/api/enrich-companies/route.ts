import { NextRequest, NextResponse } from "next/server";
import { searchCompany } from "@/lib/crustdata";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { companyNames } = (await req.json()) as { companyNames: string[] };

  if (!companyNames || companyNames.length === 0) {
    return NextResponse.json({ companies: {} });
  }

  // Limit to 20 companies max
  const names = companyNames.slice(0, 20);

  const results = await Promise.allSettled(
    names.map((name) => searchCompany(name))
  );

  const companies: Record<string, {
    linkedinLogoUrl?: string;
    website?: string;
    hq?: string;
    totalFunding?: number;
    headcount?: number;
    headcountGrowth?: number;
    industry?: string;
  }> = {};

  results.forEach((result, i) => {
    if (result.status === "fulfilled" && result.value) {
      const c = result.value;
      companies[names[i]] = {
        linkedinLogoUrl: c.linkedin_logo_url,
        website: c.company_website_domain,
        hq: c.headquarters,
        totalFunding: c.total_funding,
        headcount: c.total_headcount,
        headcountGrowth: c.headcount_growth_qoq,
        industry: c.company_industries?.[0],
      };
    }
  });

  return NextResponse.json({ companies });
}
