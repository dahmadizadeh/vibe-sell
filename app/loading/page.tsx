"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingSteps } from "@/components/LoadingSteps";
import { CodeGeneration } from "@/components/CodeGeneration";
import { useAppStore } from "@/lib/store";
import { detectBuilderScenario, getBuilderMockData, getSellerMockData } from "@/lib/mock-data";
import type { Contact, PitchPage, ProductPage, Targeting } from "@/lib/types";

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

// ─── SSE Helper ──────────────────────────────────────────────────────────────

interface SSECallbacks {
  onCodeChunk: (text: string) => void;
  onStatus: (step: string, message: string) => void;
  onAppReady: (app: { name: string; tagline: string; features: string[]; reactCode: string }) => void;
  onComplete: (data: { targeting: Targeting; productPage: ProductPage }) => void;
  onError: () => void;
}

async function consumeAnalyzeStream(description: string, callbacks: SSECallbacks) {
  const res = await fetch("/api/analyze-idea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });

  if (!res.ok || !res.body) {
    callbacks.onError();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    let currentEvent = "";
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7);
      } else if (line.startsWith("data: ") && currentEvent) {
        try {
          const data = JSON.parse(line.slice(6));
          switch (currentEvent) {
            case "code_chunk":
              callbacks.onCodeChunk(data.text);
              break;
            case "status":
              callbacks.onStatus(data.step, data.message);
              break;
            case "app_ready":
              callbacks.onAppReady(data);
              break;
            case "complete":
              callbacks.onComplete(data);
              break;
          }
        } catch {}
        currentEvent = "";
      }
    }
  }
}

// ─── Loading Content ─────────────────────────────────────────────────────────

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { getProject, updateProject, hydrate } = useAppStore();
  const startedRef = useRef(false);

  // Builder streaming state
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

  const runBuilderFlow = useCallback(
    async (projectId: string, description: string) => {
      const scenario = detectBuilderScenario(description);
      const mockData = getBuilderMockData(scenario);

      let targeting: Targeting = mockData.targeting;
      let productPage: ProductPage = mockData.productPage;
      let gotRealData = false;

      // Step 1: Stream app generation from Claude
      try {
        await consumeAnalyzeStream(description, {
          onCodeChunk: (text) => {
            setStreamedCode((prev) => prev + text);
          },
          onStatus: (step, message) => {
            setStatusMessage(message);
            if (step === "targeting") setGenStatus("targeting");
          },
          onAppReady: (app) => {
            setAppName(app.name);
            setAppTagline(app.tagline);
            setReactCode(app.reactCode);
            setGenStatus("app_ready");
            setStatusMessage("App built! Finding your customers...");
            // Save productPage immediately so it persists even if stream drops
            productPage = {
              name: app.name,
              tagline: app.tagline,
              features: app.features,
              shareUrl: `/p/${app.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").substring(0, 40)}`,
              reactCode: app.reactCode,
            };
            gotRealData = true;
          },
          onComplete: (data) => {
            if (data.targeting) targeting = data.targeting;
            // Only override productPage from complete if it has reactCode
            // (otherwise keep the one from app_ready)
            if (data.productPage?.reactCode) {
              productPage = data.productPage;
            }
          },
          onError: () => {
            // Will fall through to mock data
          },
        });
      } catch {
        // Fall through to mock data
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
      setStatusMessage(gotRealData ? "Your app is ready!" : "Done!");

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

      // Brief pause to show the complete state
      await new Promise((r) => setTimeout(r, 1500));
      router.push(`/project/${projectId}`);
    },
    [updateProject, router]
  );

  const runSellerFlow = useCallback(
    async (projectId: string, description: string, targetCompanies: string[]) => {
      const companies = targetCompanies.length > 0 ? targetCompanies : ["Stripe"];
      const allContacts: Contact[] = [];
      const allDrafts: import("@/lib/types").EmailDraft[] = [];
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
          if (pitchResult.pitchPage) {
            pitchPage = pitchResult.pitchPage;
          }
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

        if (!contacts || contacts.length === 0) {
          contacts = mockData.contacts;
        }

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

      router.push(`/project/${projectId}`);
    },
    [updateProject, router, project]
  );

  useEffect(() => {
    if (!projectId || startedRef.current) return;
    startedRef.current = true;

    const proj = getProject(projectId);
    if (!proj) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      const minWait = proj.mode === "builder" ? 0 : 5500;
      const startTime = Date.now();

      if (proj.mode === "builder") {
        await runBuilderFlow(projectId, proj.description);
      } else {
        await runSellerFlow(projectId, proj.description, proj.targetCompanies || []);
        const elapsed = Date.now() - startTime;
        if (elapsed < minWait) {
          await new Promise((r) => setTimeout(r, minWait - elapsed));
        }
      }
    };

    loadData();
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

  // Seller mode: keep existing loading steps
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
