"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingSteps } from "@/components/LoadingSteps";
import { useAppStore } from "@/lib/store";
import { detectBuilderScenario, getBuilderMockData, getSellerMockData } from "@/lib/mock-data";
import type { Contact, PitchPage } from "@/lib/types";

// ─── Cache Helpers ───────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCachedContacts(key: string): Contact[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw) as { data: Contact[]; ts: number };
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedContacts(key: string, data: Contact[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

function hashString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

// ─── Loading Content ─────────────────────────────────────────────────────────

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { getProject, updateProject, hydrate } = useAppStore();
  const startedRef = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!projectId || startedRef.current) return;
    startedRef.current = true;

    const project = getProject(projectId);
    if (!project) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      const minWait = project.mode === "builder" ? 5000 : 5500;
      const startTime = Date.now();

      if (project.mode === "builder") {
        // Step 1: Analyze idea — still mock for v1
        const scenario = detectBuilderScenario(project.description);
        const mockData = getBuilderMockData(scenario);

        await fetch("/api/analyze-idea", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: project.description }),
        }).catch(() => {});

        const targeting = mockData.targeting;
        const productPage = mockData.productPage;

        // Step 2: Find customers — try real API with cache
        const cacheKey = `crustdata_contacts_builder_${hashString(JSON.stringify(targeting))}`;
        let contacts: Contact[] | null = getCachedContacts(cacheKey);
        let dataSource: "live" | "mock" = contacts ? "live" : "mock";

        if (!contacts) {
          try {
            const res = await fetch("/api/find-customers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ targeting }),
            });
            const result = await res.json();
            if (result.contacts && result.contacts.length > 0) {
              contacts = result.contacts;
              dataSource = result.dataSource || "live";
              setCachedContacts(cacheKey, contacts!);
            }
          } catch {}
        }

        // Fallback to mock if API returned nothing
        if (!contacts || contacts.length === 0) {
          contacts = mockData.contacts;
          dataSource = "mock";
        }

        // Step 3: Generate emails — still mock for v1
        await fetch("/api/generate-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "builder",
            context: { description: project.description, shareUrl: productPage.shareUrl },
            contacts: contacts.slice(0, 3),
          }),
        }).catch(() => {});

        updateProject(projectId, {
          targeting,
          contacts,
          emailDrafts: mockData.emailDrafts,
          productPage,
          dataSource,
          stats: {
            contactsFound: contacts.length,
            emailsSent: 0,
            replies: 0,
            meetingsBooked: 0,
          },
        });
      } else {
        // ─── Seller mode ──────────────────────────────────────────────
        const companies = project.targetCompanies || ["Stripe"];
        const allContacts: Contact[] = [];
        const allDrafts: typeof project.emailDrafts = [];
        const allPitchPages: PitchPage[] = [];
        let anyLiveData = false;

        for (const company of companies) {
          const mockData = getSellerMockData(company);

          // Step 1: Generate pitch page (may have real urgency signals)
          let pitchPage = mockData.pitchPage;
          try {
            const pitchRes = await fetch("/api/generate-pitch-page", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description: project.description, company }),
            });
            const pitchResult = await pitchRes.json();
            if (pitchResult.pitchPage) {
              pitchPage = pitchResult.pitchPage;
            }
          } catch {}

          // Step 2: Find contacts — try real API with cache
          const cacheKey = `crustdata_contacts_${company.toLowerCase().replace(/\s+/g, "_")}`;
          let contacts: Contact[] | null = getCachedContacts(cacheKey);

          if (contacts) {
            anyLiveData = true;
          } else {
            try {
              const contactsRes = await fetch("/api/find-contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company }),
              });
              const contactsResult = await contactsRes.json();
              if (contactsResult.contacts && contactsResult.contacts.length > 0) {
                contacts = contactsResult.contacts;
                if (contactsResult.dataSource === "live") {
                  anyLiveData = true;
                }
                setCachedContacts(cacheKey, contacts!);
              }
            } catch {}
          }

          // Fallback to mock if API returned nothing
          if (!contacts || contacts.length === 0) {
            contacts = mockData.contacts;
          }

          allPitchPages.push(pitchPage);
          allContacts.push(...contacts);
          allDrafts.push(...mockData.emailDrafts);
        }

        // Generate emails — still mock for v1
        await fetch("/api/generate-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "seller",
            context: { description: project.description, shareUrl: allPitchPages[0]?.shareUrl || "" },
            contacts: allContacts.slice(0, 3),
          }),
        }).catch(() => {});

        const canonicalCompanies = allPitchPages.map((pp) => pp.targetCompany);

        updateProject(projectId, {
          contacts: allContacts,
          emailDrafts: allDrafts,
          pitchPages: allPitchPages,
          targetCompanies: canonicalCompanies,
          dataSource: anyLiveData ? "live" : "mock",
          stats: {
            contactsFound: allContacts.length,
            emailsSent: 0,
            replies: 0,
            meetingsBooked: 0,
          },
        });
      }

      // Wait for minimum animation time
      const elapsed = Date.now() - startTime;
      if (elapsed < minWait) {
        await new Promise((r) => setTimeout(r, minWait - elapsed));
      }

      router.push(`/project/${projectId}`);
    };

    loadData();
  }, [projectId, getProject, updateProject, router, hydrate]);

  const project = getProject(projectId || "");

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <LoadingSteps
        mode={project?.mode || "builder"}
        company={project?.targetCompanies?.[0]}
      />
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoadingContent />
    </Suspense>
  );
}
