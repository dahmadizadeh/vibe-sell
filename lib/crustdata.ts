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
  linkedin_flagship_url?: string;
  profile_picture_url?: string;
  profile_photo_url?: string;
  avatar_url?: string;
  photo_url?: string;
  image_url?: string;
  current_employers?: Array<{
    employee_title?: string;
    employer_name?: string;
    employer_company_website_domain?: string[];
    company_headcount_latest?: number;
    company_industries?: string[];
    seniority_level?: string;
    function_category?: string;
    business_emails?: {
      current_work_email?: string;
      recommended_personal_email?: string;
    } | string[];
    // Legacy field names (some endpoints may still return these)
    title?: string;
    company_name?: string;
    company_website_domain?: string;
    department?: string;
    business_email?: string;
  }>;
}

export interface CrustdataCompanyRecord {
  company_name?: string;
  company_website_domain?: string;
  total_headcount?: number;
  headcount_growth_qoq?: number;
  job_openings_count?: number;
  total_funding?: number;
  company_industries?: string[];
  linkedin_logo_url?: string;
  linkedin_company_url?: string;
  headquarters?: string;
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
    if (profiles.length > 0) {
      const p = profiles[0];
      console.log("[crustdata] First profile keys:", Object.keys(p));
      console.log("[crustdata] First profile photo fields:", {
        profile_picture_url: p.profile_picture_url,
        profile_photo_url: p.profile_photo_url,
        avatar_url: p.avatar_url,
      });
      if (p.current_employers?.[0]) {
        console.log("[crustdata] First employer keys:", Object.keys(p.current_employers[0]));
      }
    }
    return profiles;
  } finally {
    clearTimeout(timeout);
  }
}

export async function enrichPeople(
  linkedinUrls: string[]
): Promise<Array<{ linkedin_profile_url: string; business_email?: string; profile_photo_url?: string }>> {
  if (!API_KEY) throw new Error("CRUSTDATA_API_KEY not set");
  if (linkedinUrls.length === 0) return [];

  const results: Array<{ linkedin_profile_url: string; business_email?: string; profile_photo_url?: string }> = [];

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
      const employer = p.current_employers?.[0];
      let email: string | undefined;
      if (employer?.business_emails) {
        if (Array.isArray(employer.business_emails)) {
          email = employer.business_emails[0] || undefined;
        } else if (typeof employer.business_emails === "object") {
          email = employer.business_emails.current_work_email || employer.business_emails.recommended_personal_email || undefined;
        }
      }
      if (!email && employer?.business_email) {
        email = employer.business_email;
      }
      const linkedinUrl = p.linkedin_profile_url || p.linkedin_flagship_url;
      const photoUrl = p.profile_picture_url || p.profile_photo_url || p.avatar_url || p.photo_url || p.image_url;
      if (linkedinUrl) {
        results.push({
          linkedin_profile_url: linkedinUrl,
          business_email: email,
          profile_photo_url: photoUrl || undefined,
        });
      }
    }
  }

  return results;
}

export async function searchCompany(
  companyName: string,
  companyWebsite?: string
): Promise<CrustdataCompanyRecord | null> {
  if (!API_KEY) throw new Error("CRUSTDATA_API_KEY not set");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const body: Record<string, string> = {};
    if (companyWebsite) {
      body.query_company_website = companyWebsite;
    } else {
      body.query_company_name = companyName;
    }

    const res = await fetch(`${BASE_URL}/screener/identify`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Crustdata company identify failed: ${res.status}`);
    }

    const data = await res.json();
    // /screener/identify returns a single company or array
    if (Array.isArray(data)) return data[0] || null;
    if (data.company) return data.company;
    return data || null;
  } finally {
    clearTimeout(timeout);
  }
}

export interface CrustdataLinkedInPost {
  authorName: string;
  authorTitle: string;
  authorCompany: string;
  authorLinkedinUrl: string;
  authorPhotoUrl?: string;
  content: string;
  date: string;
  postUrl?: string;
  likes: number;
  comments: number;
}

function mapRawPost(raw: Record<string, unknown>): CrustdataLinkedInPost {
  return {
    // Crustdata fields first, then legacy fallbacks
    authorName: (raw.actor_name || raw.author_name || raw.name || "") as string,
    authorTitle: (raw.actor_title || raw.author_title || raw.headline || "") as string,
    authorCompany: (raw.actor_company || raw.author_company || raw.company || "") as string,
    authorLinkedinUrl: (raw.actor_linkedin_url || raw.author_linkedin_url || raw.profile_url || "") as string,
    authorPhotoUrl: (raw.actor_profile_picture_url || raw.author_profile_photo || "") as string || undefined,
    content: (raw.text || raw.content || raw.body || "") as string,
    date: (raw.date_posted || raw.posted_at || raw.date || "") as string,
    postUrl: (raw.share_url || raw.post_url || raw.url || "") as string || undefined,
    likes: (raw.total_reactions || raw.reactions_count || raw.likes || 0) as number,
    comments: (raw.total_comments || raw.comments_count || raw.comments || 0) as number,
  };
}

export async function searchLinkedInPosts(
  keywords: string[],
  limit: number = 20
): Promise<CrustdataLinkedInPost[]> {
  if (!API_KEY) throw new Error("CRUSTDATA_API_KEY not set");

  // Crustdata keyword search supports max ~6 keywords with OR.
  // Batch keywords into groups of 5 to stay within limits, then merge + deduplicate.
  const BATCH_SIZE = 5;
  const batches: string[][] = [];
  for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
    batches.push(keywords.slice(i, i + BATCH_SIZE));
  }

  console.log("[crustdata] searchLinkedInPosts: keywords=", keywords, "batches=", batches.length);

  const allPosts: CrustdataLinkedInPost[] = [];
  const seenUrls = new Set<string>();

  for (const batch of batches) {
    const keywordString = batch.join(" OR ");
    const pagesNeeded = Math.ceil(limit / 10);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      for (let page = 1; page <= pagesNeeded; page++) {
        const res = await fetch(`${BASE_URL}/screener/linkedin_posts/keyword_search/`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            keyword: keywordString,
            page,
            date_posted: "past-month",
            sort_by: "relevance",
          }),
          signal: controller.signal,
        });

        console.log("[crustdata] searchLinkedInPosts batch=", batch.join(","), "page=", page, "status:", res.status);

        if (!res.ok) {
          const body = await res.text();
          console.error("[crustdata] searchLinkedInPosts error:", body.slice(0, 500));
          // Don't throw on individual batch failure — try remaining batches
          break;
        }

        const data = await res.json();
        if (page === 1 && batches.indexOf(batch) === 0) {
          console.log("[crustdata] searchLinkedInPosts response keys:", Object.keys(data));
        }

        const rawPosts: Record<string, unknown>[] = data.posts || data.results || (Array.isArray(data) ? data : []);
        if (rawPosts.length > 0 && page === 1 && batches.indexOf(batch) === 0) {
          console.log("[crustdata] First raw post keys:", Object.keys(rawPosts[0]));
          console.log("[crustdata] First raw post sample:", JSON.stringify(rawPosts[0], null, 2).slice(0, 500));
        }

        const mapped = rawPosts.map(mapRawPost);
        const valid = mapped.filter(
          (p) => p.content && p.content.length > 20 && p.authorName && p.authorName !== "Unknown"
        );

        // Deduplicate by postUrl
        for (const post of valid) {
          const key = post.postUrl || `${post.authorName}:${post.content.slice(0, 100)}`;
          if (!seenUrls.has(key)) {
            seenUrls.add(key);
            allPosts.push(post);
          }
        }

        if (rawPosts.length === 0 || allPosts.length >= limit) break;
      }
    } finally {
      clearTimeout(timeout);
    }

    // Stop if we have enough posts across all batches
    if (allPosts.length >= limit) break;
  }

  console.log("[crustdata] searchLinkedInPosts: total", allPosts.length, "valid unique posts");
  return allPosts.slice(0, limit);
}

// ─── Full Person Enrichment ──────────────────────────────────────────────────

export async function enrichPersonFull(
  linkedinUrl: string
): Promise<CrustdataPersonRecord | null> {
  if (!API_KEY) throw new Error("CRUSTDATA_API_KEY not set");

  const params = new URLSearchParams();
  params.append("linkedin_profile_url", linkedinUrl);

  const res = await fetch(`${BASE_URL}/screener/person/enrich?${params}`, {
    headers: { Authorization: `Token ${API_KEY}` },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[crustdata] enrichPersonFull error:", res.status, body.slice(0, 300));
    throw new Error(`Crustdata person enrich failed: ${res.status}`);
  }

  const data = await res.json();
  const profiles: CrustdataPersonRecord[] = data.profiles || data.results || (Array.isArray(data) ? data : [data]);
  return profiles[0] || null;
}

// ─── Person LinkedIn Posts ──────────────────────────────────────────────────

export interface PersonLinkedInPost {
  content: string;
  reactions: number;
  comments: number;
  date?: string;
}

export async function getPersonLinkedInPosts(
  linkedinUrl: string,
  pages: number = 1
): Promise<PersonLinkedInPost[]> {
  if (!API_KEY) throw new Error("CRUSTDATA_API_KEY not set");

  const allPosts: PersonLinkedInPost[] = [];

  for (let page = 1; page <= pages; page++) {
    try {
      const params = new URLSearchParams();
      params.append("person_linkedin_url", linkedinUrl);
      params.append("page", String(page));

      const res = await fetch(`${BASE_URL}/screener/linkedin_posts?${params}`, {
        headers: { Authorization: `Token ${API_KEY}` },
      });

      if (!res.ok) {
        console.warn("[crustdata] getPersonLinkedInPosts page", page, "failed:", res.status);
        break;
      }

      const data = await res.json();
      const rawPosts: Record<string, unknown>[] = data.posts || data.results || (Array.isArray(data) ? data : []);

      for (const raw of rawPosts) {
        allPosts.push({
          content: ((raw.text || raw.content || raw.body || "") as string).slice(0, 500),
          reactions: (raw.total_reactions || raw.reactions_count || raw.likes || 0) as number,
          comments: (raw.total_comments || raw.comments_count || raw.comments || 0) as number,
          date: (raw.date_posted || raw.posted_at || raw.date || "") as string,
        });
      }

      if (rawPosts.length === 0) break;
    } catch (err) {
      console.warn("[crustdata] getPersonLinkedInPosts error:", err);
      break;
    }
  }

  return allPosts;
}

// ─── Mapping Helpers ─────────────────────────────────────────────────────────

export function mapPersonToContact(
  person: CrustdataPersonRecord,
  index: number,
  matchReasonTemplate?: string
): Contact | null {
  const employer = person.current_employers?.[0];
  if (!employer) return null;

  const name = person.name || "Unknown";
  const firstName = person.first_name || name.split(" ")[0] || "Unknown";
  const title = employer.employee_title || employer.title || "Unknown Title";
  const companyName = employer.employer_name || employer.company_name || "";
  const companyDomain = employer.employer_company_website_domain?.[0] || employer.company_website_domain || "";
  const company = normalizeCompanyName(companyName || companyDomain || "Unknown");
  const headcount = employer.company_headcount_latest || 0;
  const industry = employer.company_industries?.[0] || "Technology";
  const photoUrl = person.profile_picture_url || person.profile_photo_url || person.avatar_url || person.photo_url || person.image_url;

  // Debug: log when no photo URL found
  if (!photoUrl) {
    const personKeys = Object.keys(person);
    const photoKeys = personKeys.filter((k) => /photo|picture|image|avatar/i.test(k));
    if (photoKeys.length > 0) {
      console.log("[crustdata] Unrecognized photo fields for", person.name, ":", photoKeys);
    }
  }

  // Extract email from business_emails (object or array) with legacy fallback
  let email: string | undefined;
  if (employer.business_emails) {
    if (Array.isArray(employer.business_emails)) {
      email = employer.business_emails[0] || undefined;
    } else if (typeof employer.business_emails === "object") {
      email = employer.business_emails.current_work_email || employer.business_emails.recommended_personal_email || undefined;
    }
  }
  if (!email && employer.business_email) {
    email = employer.business_email;
  }

  let matchReason: string;
  if (matchReasonTemplate) {
    matchReason = matchReasonTemplate
      .replace(/\{title\}/g, title)
      .replace(/\{company\}/g, company)
      .replace(/\{headcount\}/g, headcount.toString())
      .replace(/\{industry\}/g, industry);
  } else {
    matchReason = generateMatchReason(person);
  }

  return {
    id: `cd-${index}-${Date.now()}`,
    name,
    firstName,
    title,
    company,
    companySize: headcount,
    industry,
    department: employer.function_category || employer.department,
    roleTag: inferRoleTag(title, employer.seniority_level || ""),
    matchReason,
    relevance: "strong",
    linkedinUrl: person.linkedin_profile_url || person.linkedin_flagship_url || "",
    email,
    profilePhotoUrl: photoUrl || undefined,
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
  const title = employer.employee_title || employer.title;
  const companyName = employer.employer_name || employer.company_name;
  if (title) parts.push(title);
  if (companyName) parts.push(`at ${companyName}`);
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

