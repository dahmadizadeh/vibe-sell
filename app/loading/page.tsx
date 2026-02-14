"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingSteps } from "@/components/LoadingSteps";
import { CodeGeneration } from "@/components/CodeGeneration";
import { useAppStore } from "@/lib/store";
import { detectBuilderScenario, getBuilderMockData, getSellerMockData } from "@/lib/mock-data";
import type { Contact, PitchPage, ProductPage, Targeting, EmailDraft } from "@/lib/types";

// ─── Cache Helpers ───────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000;

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

  // Builder UI state
  const [streamedCode, setStreamedCode] = useState("");
  const [genStatus, setGenStatus] = useState<
    "generating" | "app_ready" | "targeting" | "finding_customers" | "complete"
  >("generating");
  const [statusMessage, setStatusMessage] = useState("Building your app...");
  const [appName, setAppName] = useState<string>();
  const [appTagline, setAppTagline] = useState<string>();
  const [reactCode, setReactCode] = useState<string>();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const project = getProject(projectId || "");
  const isBuilder = project?.mode === "builder";

  // Animate code appearing character by character
  const animateCode = useCallback((code: string) => {
    let i = 0;
    const chunkSize = 15; // characters per tick
    const interval = setInterval(() => {
      i += chunkSize;
      if (i >= code.length) {
        setStreamedCode(code);
        clearInterval(interval);
      } else {
        setStreamedCode(code.slice(0, i));
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const runBuilderFlow = useCallback(
    async (pid: string, description: string) => {
      const scenario = detectBuilderScenario(description);
      const mockData = getBuilderMockData(scenario);

      let targeting: Targeting = mockData.targeting;
      let productPage: ProductPage = mockData.productPage;

      // Step 1: Call analyze-idea API (regular JSON, not SSE)
      setGenStatus("generating");
      setStatusMessage("Building your app...");

      try {
        const res = await fetch("/api/analyze-idea", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        });
        const result = await res.json();

        if (result.productPage?.reactCode) {
          // Real AI response
          productPage = result.productPage;
          targeting = result.targeting || targeting;

          // Show the code being "typed"
          setAppName(productPage.name);
          setAppTagline(productPage.tagline);
          setGenStatus("app_ready");
          setStatusMessage(`${productPage.name} built! Finding your customers...`);

          // Animate code appearing
          animateCode(productPage.reactCode!);
          setReactCode(productPage.reactCode);

          // Small delay so user sees the preview
          await new Promise((r) => setTimeout(r, 3000));
        } else {
          // Fallback response (mock data from server)
          if (result.targeting) targeting = result.targeting;
          if (result.productPage) productPage = result.productPage;
        }
      } catch (err) {
        console.error("analyze-idea fetch failed:", err);
        // Keep mock data
      }

      // Step 2: Find customers
      setGenStatus("finding_customers");
      setStatusMessage("Searching 700M+ professionals...");

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
          context: { description, shareUrl: productPage.shareUrl },
          contacts: contacts.slice(0, 3),
        }),
      }).catch(() => {});

      setGenStatus("complete");
      setStatusMessage(productPage.reactCode ? "Your app is ready!" : "Done!");

      updateProject(pid, {
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

      // Brief pause to show complete state
      await new Promise((r) => setTimeout(r, 1500));
      router.push(`/project/${pid}`);
    },
    [updateProject, router, animateCode]
  );

  const runSellerFlow = useCallback(
    async (pid: string, description: string, targetCompanies: string[]) => {
      const minWait = 5500;
      const startTime = Date.now();
      const companies = targetCompanies.length > 0 ? targetCompanies : ["Stripe"];
      const allContacts: Contact[] = [];
      const allDrafts: EmailDraft[] = [];
      const allPitchPages: PitchPage[] = [];
      let anyLiveData = false;

      for (const company of companies) {
        const mockData = getSellerMockData(company);

        let pitchPage = mockData.pitchPage;
        try {
          const pitchRes = await fetch("/api/generate-pitch-page", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description, company }),
          });
          const pitchResult = await pitchRes.json();
          if (pitchResult.pitchPage) pitchPage = pitchResult.pitchPage;
        } catch {}

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
              if (contactsResult.dataSource === "live") anyLiveData = true;
              setCachedContacts(cacheKey, contacts!);
            }
          } catch {}
        }

        if (!contacts || contacts.length === 0) contacts = mockData.contacts;

        allPitchPages.push(pitchPage);
        allContacts.push(...contacts);
        allDrafts.push(...mockData.emailDrafts);
      }

      await fetch("/api/generate-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "seller",
          context: { description, shareUrl: allPitchPages[0]?.shareUrl || "" },
          contacts: allContacts.slice(0, 3),
        }),
      }).catch(() => {});

      updateProject(pid, {
        contacts: allContacts,
        emailDrafts: allDrafts,
        pitchPages: allPitchPages,
        targetCompanies: allPitchPages.map((pp) => pp.targetCompany),
        dataSource: anyLiveData ? "live" : "mock",
        stats: {
          contactsFound: allContacts.length,
          emailsSent: 0,
          replies: 0,
          meetingsBooked: 0,
        },
      });

      const elapsed = Date.now() - startTime;
      if (elapsed < minWait) await new Promise((r) => setTimeout(r, minWait - elapsed));
      router.push(`/project/${pid}`);
    },
    [updateProject, router]
  );

  useEffect(() => {
    if (!projectId || startedRef.current) return;
    startedRef.current = true;

    const proj = getProject(projectId);
    if (!proj) {
      router.push("/");
      return;
    }

    if (proj.mode === "builder") {
      runBuilderFlow(projectId, proj.description);
    } else {
      runSellerFlow(projectId, proj.description, proj.targetCompanies || []);
    }
  }, [projectId, getProject, router, hydrate, runBuilderFlow, runSellerFlow]);

  // Builder mode: show code generation UI
  if (isBuilder) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8">
        <CodeGeneration
          streamedCode={streamedCode}
          status={genStatus}
          statusMessage={statusMessage}
          appName={appName}
          appTagline={appTagline}
          reactCode={reactCode}
        />
      </div>
    );
  }

  // Seller mode: existing loading steps
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <LoadingSteps
        mode={project?.mode || "seller"}
        company={project?.targetCompanies?.[0]}
      />
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoadingContent />
    </Suspense>
  );
}
