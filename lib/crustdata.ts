import type { Contact, RoleTag } from "./types";

// ─── Internal Types ──────────────────────────────────────────────────────────

type CrustdataFilter =
  | { column: string; type: string; value: string | string[] | number }
  | { op: string; conditions: CrustdataFilter[] };

interface CrustdataPersonRecord {
  name?: string;
  first_name?: string;
  headline?: string;
  region?: string;
  linkedin_profile_url?: string;
  current_employers?: Array<{
    title?: string;
    company_name?: string;
    company_website_domain?: string;
    company_headcount_latest?: number;
    company_industries?: string[];
    seniority_level?: string;
    department?: string;
    business_email?: string;
    business_email_verified?: boolean;
  }>;
}

interface CrustdataCompanyRecord {
  company_name?: string;
  company_website_domain?: string;
  total_headcount?: number;
  headcount_growth_qoq?: number;
  job_openings_count?: number;
  total_funding?: number;
  company_industries?: string[];
}

// ─── API Functions ───────────────────────────────────────────────────────────

const API_KEY = process.env.CRUSTDATA_API_KEY;
const BASE_URL = "https://api.crustdata.com";

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Token ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function searchPeople(
  conditions: CrustdataFilter[],
  limit: number = 100
): Promise<CrustdataPersonRecord[]> {
  if (!API_KEY) throw new Error("CRUSTDATA_API_KEY not set");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const requestBody = {
    filters: { op: "and", conditions },
    limit,
  };

  console.log("[crustdata] searchPeople request URL:", `${BASE_URL}/screener/persondb/search`);
  console.log("[crustdata] searchPeople request body:", JSON.stringify(requestBody, null, 2));
  console.log("[crustdata] API key present:", !!API_KEY, "length:", API_KEY?.length);

  try {
    const res = await fetch(`${BASE_URL}/screener/persondb/search`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    console.log("[crustdata] searchPeople response status:", res.status, res.statusText);

    if (!res.ok) {
      const body = await res.text();
      console.error("[crustdata] searchPeople error body:", body.slice(0, 1000));
      throw new Error(`Crustdata search failed: ${res.status} ${res.statusText} — ${body.slice(0, 300)}`);
    }

    const data = await res.json();
    const profiles = data.profiles || data.results || data || [];
    console.log("[crustdata] searchPeople returned", profiles.length, "profiles. Response keys:", Object.keys(data));
    return profiles;
  } finally {
    clearTimeout(timeout);
  }
}

export async function enrichPeople(
  linkedinUrls: string[]
): Promise<Array<{ linkedin_profile_url: string; business_email?: string }>> {
  if (!API_KEY) throw new Error("CRUSTDATA_API_KEY not set");
  if (linkedinUrls.length === 0) return [];

  const results: Array<{ linkedin_profile_url: string; business_email?: string }> = [];

  // Batch in groups of 25
  for (let i = 0; i < linkedinUrls.length; i += 25) {
    const batch = linkedinUrls.slice(i, i + 25);
    const params = new URLSearchParams();
    batch.forEach((url) => params.append("linkedin_profile_url", url));
    params.append("fields", "business_email");

    const res = await fetch(`${BASE_URL}/screener/person/enrich?${params}`, {
      headers: { Authorization: `Token ${API_KEY}` },
    });

    if (!res.ok) {
      throw new Error(`Crustdata enrich failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const profiles: CrustdataPersonRecord[] = data.profiles || data.results || data || [];

    for (const p of profiles) {
      const email = p.current_employers?.[0]?.business_email;
      if (p.linkedin_profile_url) {
        results.push({
          linkedin_profile_url: p.linkedin_profile_url,
          business_email: email || undefined,
        });
      }
    }
  }

  return results;
}

export async function searchCompany(
  companyName: string
): Promise<CrustdataCompanyRecord | null> {
  if (!API_KEY) throw new Error("CRUSTDATA_API_KEY not set");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${BASE_URL}/screener/company/search`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        filters: {
          op: "and",
          conditions: [
            { column: "company_name", type: "(.)", value: companyName },
          ],
        },
        limit: 1,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Crustdata company search failed: ${res.status}`);
    }

    const data = await res.json();
    const companies = data.companies || data.results || data || [];
    return companies[0] || null;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Mapping Helpers ─────────────────────────────────────────────────────────

export function mapPersonToContact(
  person: CrustdataPersonRecord,
  index: number
): Contact | null {
  const employer = person.current_employers?.[0];
  if (!employer) return null;

  const name = person.name || "Unknown";
  const firstName = person.first_name || name.split(" ")[0] || "Unknown";

  return {
    id: `cd-${index}-${Date.now()}`,
    name,
    firstName,
    title: employer.title || "Unknown Title",
    company: normalizeCompanyName(employer.company_name || employer.company_website_domain || "Unknown"),
    companySize: employer.company_headcount_latest || 0,
    industry: employer.company_industries?.[0] || "Technology",
    department: employer.department,
    roleTag: inferRoleTag(employer.title || "", employer.seniority_level || ""),
    matchReason: generateMatchReason(person),
    relevance: "strong",
    linkedinUrl: person.linkedin_profile_url || "",
    email: employer.business_email || undefined,
  };
}

export function inferRoleTag(title: string, seniorityLevel: string): RoleTag {
  const upper = `${title} ${seniorityLevel}`.toUpperCase();
  if (
    upper.includes("CXO") ||
    upper.includes("CEO") ||
    upper.includes("CTO") ||
    upper.includes("CFO") ||
    upper.includes("COO") ||
    upper.includes("CMO") ||
    upper.includes("VP") ||
    upper.includes("VICE PRESIDENT") ||
    upper.includes("HEAD OF")
  ) {
    return "decision_maker";
  }
  if (
    upper.includes("ENGINEER") ||
    upper.includes("ARCHITECT") ||
    upper.includes("DEVELOPER") ||
    upper.includes("TECHNICAL")
  ) {
    return "technical_evaluator";
  }
  return "champion";
}

function generateMatchReason(person: CrustdataPersonRecord): string {
  const employer = person.current_employers?.[0];
  if (!employer) return "Matches targeting criteria";

  const parts: string[] = [];
  if (employer.title) parts.push(employer.title);
  if (employer.company_name) parts.push(`at ${employer.company_name}`);
  if (employer.company_headcount_latest) {
    parts.push(`(${employer.company_headcount_latest} employees)`);
  }
  if (employer.company_industries?.[0]) {
    parts.push(`in ${employer.company_industries[0]}`);
  }

  return parts.length > 0
    ? parts.join(" ")
    : "Matches targeting criteria";
}

export function normalizeCompanyName(raw: string): string {
  return raw
    .replace(/\.(com|io|co|org|net|ai|dev)$/i, "")
    .replace(/^www\./i, "")
    .split(/[.-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .trim();
}

