import { NextRequest, NextResponse } from "next/server";
import { getSellerMockData } from "@/lib/mock-data";
import { searchCompany } from "@/lib/crustdata";

export async function POST(req: NextRequest) {
  const { description, company } = (await req.json()) as { description: string; company: string };

  void description;
  const data = getSellerMockData(company);
  const pitchPage = { ...data.pitchPage };

  // Try to enrich urgency signals with real company data
  try {
    const companyData = await searchCompany(company);
    if (companyData) {
      const realSignals: string[] = [];

      if (companyData.headcount_growth_qoq && companyData.headcount_growth_qoq > 0) {
        realSignals.push(
          `${companyData.company_name || company} grew headcount ${Math.round(companyData.headcount_growth_qoq * 100)}% quarter-over-quarter`
        );
      }
      if (companyData.job_openings_count && companyData.job_openings_count > 0) {
        realSignals.push(
          `Currently has ${companyData.job_openings_count} open job postings`
        );
      }
      if (companyData.total_funding && companyData.total_funding > 0) {
        const fundingM = Math.round(companyData.total_funding / 1_000_000);
        realSignals.push(
          `Raised $${fundingM}M in total funding`
        );
      }

      if (realSignals.length > 0) {
        // Replace first N mock signals with real ones
        pitchPage.urgencySignals = [
          ...realSignals,
          ...pitchPage.urgencySignals.slice(realSignals.length),
        ];
      }
    }
  } catch (error) {
    // Silently continue with mock urgency signals
    console.error("Crustdata company search error (non-fatal):", error);
  }

  return NextResponse.json({ pitchPage });
}
