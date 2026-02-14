"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingSteps } from "@/components/LoadingSteps";
import { CodeGeneration } from "@/components/CodeGeneration";
import { useAppStore } from "@/lib/store";
import type { Contact, PitchPage, ProductPage, Targeting, EmailDraft, ViabilityAnalysis, AudienceGroup, PostTemplate, ImportedAnalysis, LinkedInPost } from "@/lib/types";
import { generateSlug } from "@/lib/utils";

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

// ─── Builder Loading Steps ──────────────────────────────────────────────────

type BuilderStep =
  | "generating"
  | "app_ready"
  | "analyzing"
  | "targeting"
  | "finding_customers"
  | "finding_network"
  | "creating_content"
  | "complete";

function getBuilderSteps(source?: string): { key: string; label: string }[] {
  if (source === 'url') return [
    { key: "generating", label: "Analyze Product" },
    { key: "analyzing", label: "Analyze Viability" },
    { key: "finding_customers", label: "Find People" },
    { key: "finding_network", label: "LinkedIn Strategy" },
    { key: "creating_content", label: "Go-to-Market" },
    { key: "complete", label: "Done" },
  ];
  if (source === 'description') return [
    { key: "analyzing", label: "Analyze Viability" },
    { key: "finding_customers", label: "Find People" },
    { key: "finding_network", label: "LinkedIn Strategy" },
    { key: "creating_content", label: "Go-to-Market" },
    { key: "complete", label: "Done" },
  ];
  return [
    { key: "generating", label: "Build App" },
    { key: "analyzing", label: "Analyze Viability" },
    { key: "finding_customers", label: "Find People" },
    { key: "finding_network", label: "LinkedIn Strategy" },
    { key: "creating_content", label: "Go-to-Market" },
    { key: "complete", label: "Done" },
  ];
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
  const [genStatus, setGenStatus] = useState<BuilderStep>("generating");
  const [statusMessage, setStatusMessage] = useState("Building your app...");
  const [appName, setAppName] = useState<string>();
  const [appTagline, setAppTagline] = useState<string>();
  const [reactCode, setReactCode] = useState<string>();
  const [stepDetails, setStepDetails] = useState<string[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const project = getProject(projectId || "");
  const isBuilder = project?.mode === "builder";

  const addStepDetail = useCallback((detail: string) => {
    setStepDetails((prev) => [...prev, detail]);
  }, []);

  const animateCode = useCallback((code: string) => {
    let i = 0;
    const chunkSize = 20;
    const interval = setInterval(() => {
      i += chunkSize;
      if (i >= code.length) {
        setStreamedCode(code);
        clearInterval(interval);
      } else {
        setStreamedCode(code.slice(0, i));
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Show progressive placeholder while API is pending
  useEffect(() => {
    if (genStatus !== "generating" || reactCode || project?.source === 'url' || project?.source === 'description') return;
    const lines = [
      "// Analyzing your idea...",
      "// Setting up React component...",
      "",
      "function App() {",
      "  const [data, setData] = React.useState(null);",
      "",
      "  // Building UI components...",
    ];
    let lineIdx = 0;
    let charIdx = 0;
    let current = "";
    const interval = setInterval(() => {
      if (lineIdx >= lines.length) {
        clearInterval(interval);
        return;
      }
      const line = lines[lineIdx];
      if (charIdx <= line.length) {
        current = lines.slice(0, lineIdx).join("\n") + "\n" + line.slice(0, charIdx);
        setStreamedCode(current);
        charIdx++;
      } else {
        lineIdx++;
        charIdx = 0;
      }
    }, 40);
    return () => clearInterval(interval);
  }, [genStatus, reactCode, project?.source]);

  const runBuilderFlow = useCallback(
    async (pid: string, description: string, source?: string, externalAppUrl?: string) => {
      let targeting: Targeting | undefined;
      let productPage: ProductPage | undefined;
      let viabilityAnalysis: ViabilityAnalysis | undefined;
      let audienceGroups: AudienceGroup[] | undefined;
      let posts: PostTemplate[] | undefined;
      let suggestedQuestions: string[] | undefined;
      let enrichedDescription = description;

      // ── Step 1: Build the app / Analyze URL / Skip ─────────────────
      if (source === 'url' && externalAppUrl) {
        // URL import: analyze the external URL
        setGenStatus("generating");
        setStatusMessage("Analyzing your product...");

        try {
          const res = await fetch("/api/analyze-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: externalAppUrl }),
          });

          if (res.ok) {
            const result = await res.json();
            if (result.analysis) {
              const analysis = result.analysis as ImportedAnalysis;
              updateProject(pid, { importedAnalysis: analysis });

              // Enrich description for subsequent steps
              enrichedDescription = `${analysis.name}: ${analysis.description}. Target user: ${analysis.targetUser}. Industry: ${analysis.industry}. ${description}`;

              // Build a minimal productPage (no reactCode)
              productPage = {
                name: analysis.name,
                tagline: analysis.tagline,
                features: analysis.features,
                shareUrl: `/p/${generateSlug(analysis.name)}`,
              };

              setAppName(analysis.name);
              setAppTagline(analysis.tagline);
              addStepDetail(`Analyzed "${analysis.name}" \u2014 ${analysis.tagline}`);
            }
          } else {
            console.warn("[loading] analyze-url failed, continuing with raw description");
            addStepDetail("Could not analyze URL \u2014 continuing with your description...");
          }
        } catch (err) {
          console.warn("[loading] analyze-url fetch failed:", err);
          addStepDetail("Could not reach URL \u2014 continuing with your description...");
        }
      } else if (source === 'description') {
        // Description-only: skip Step 1 entirely
      } else {
        // Default idea flow: stream app generation
        setGenStatus("generating");
        setStatusMessage("Building your app...");

        let streamSuccess = false;
        try {
          const res = await fetch("/api/stream-app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description }),
          });

          if (res.ok && res.body) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              accumulated += chunk;
              setStreamedCode(accumulated);
            }

            // Parse the complete response
            try {
              const cleaned = accumulated.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
              const parsed = JSON.parse(cleaned);
              productPage = {
                name: parsed.name,
                tagline: parsed.tagline,
                features: parsed.features,
                shareUrl: `/p/${generateSlug(parsed.name)}`,
                reactCode: parsed.reactCode,
              };

              setAppName(productPage.name);
              setAppTagline(productPage.tagline);
              setGenStatus("app_ready");
              setStatusMessage(`${productPage.name} built!`);
              addStepDetail(`Generated "${productPage.name}" \u2014 ${productPage.tagline}`);
              setReactCode(productPage.reactCode);
              streamSuccess = true;

              await new Promise((r) => setTimeout(r, 2000));
            } catch (parseErr) {
              console.error("[loading] stream-app parse failed:", parseErr);
            }
          }
        } catch (err) {
          console.error("[loading] stream-app fetch failed:", err);
        }

        // Fallback to non-streaming if streaming failed
        if (!streamSuccess) {
          try {
            const res = await fetch("/api/analyze-idea", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description }),
            });

            if (!res.ok) {
              addStepDetail("App generation encountered an issue \u2014 continuing with analysis...");
            } else {
              const result = await res.json();
              if (result.productPage?.reactCode) {
                productPage = result.productPage;
                targeting = result.targeting || targeting;
                setAppName(productPage!.name);
                setAppTagline(productPage!.tagline);
                setGenStatus("app_ready");
                setStatusMessage(`${productPage!.name} built!`);
                addStepDetail(`Generated "${productPage!.name}" \u2014 ${productPage!.tagline}`);
                animateCode(productPage!.reactCode!);
                setReactCode(productPage!.reactCode);
                await new Promise((r) => setTimeout(r, 2000));
              } else if (result.productPage) {
                productPage = result.productPage;
                targeting = result.targeting || targeting;
                setAppName(productPage!.name);
              }
            }
          } catch (err) {
            console.error("[loading] analyze-idea fetch failed:", err);
            addStepDetail("App generation failed \u2014 check API key configuration");
          }
        }
      }

      // ── Step 2: Analyze viability + smart targeting (parallel) ─────
      setGenStatus("analyzing");
      setStatusMessage("Analyzing business viability...");

      try {
        const res = await fetch("/api/analyze-viability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: enrichedDescription,
            appName: productPage?.name || "My App",
          }),
        });
        const result = await res.json();

        if (result.viabilityAnalysis) {
          viabilityAnalysis = result.viabilityAnalysis;
          setStatusMessage(
            `${result.viabilityAnalysis.verdict} \u2014 ${result.viabilityAnalysis.overallScore}/100`
          );
          addStepDetail(
            `Score: ${result.viabilityAnalysis.overallScore}/100 (${result.viabilityAnalysis.verdict}) \u2014 ${result.viabilityAnalysis.summary.slice(0, 80)}...`
          );
        }

        if (result.suggestedQuestions) {
          suggestedQuestions = result.suggestedQuestions;
        }

        if (result.smartTargeting) {
          targeting = result.smartTargeting.targeting || targeting;
          audienceGroups = result.smartTargeting.audienceGroups;
          setGenStatus("targeting");
          const groupList = audienceGroups?.map((g) => `${g.count} ${g.name.toLowerCase()}`).join(", ") || "";
          setStatusMessage(`Identified ${audienceGroups?.length || 0} audience groups`);
          addStepDetail(`Found groups: ${groupList}`);
          await new Promise((r) => setTimeout(r, 1200));
        }
      } catch (err) {
        console.error("analyze-viability fetch failed:", err);
      }

      // ── Step 3: Find real people per audience group ────────────────
      setGenStatus("finding_customers");
      setStatusMessage("Searching 700M+ professionals...");

      let allContacts: Contact[] = [];
      let dataSource: "live" | "mock" = "mock";

      if (audienceGroups && audienceGroups.length > 0) {
        for (const group of audienceGroups) {
          setStatusMessage(`Finding ${group.name}...`);

          // Prefer crustdataConditions (direct filter conditions from AI) over flat Targeting
          const useDirectConditions = group.crustdataConditions && group.crustdataConditions.length > 0;

          const cacheKey = useDirectConditions
            ? `crustdata_contacts_v2_${hashString(JSON.stringify(group.crustdataConditions))}`
            : `crustdata_contacts_builder_${hashString(JSON.stringify({
                industries: group.searchFilters.industries,
                titles: group.searchFilters.titles,
                regions: group.searchFilters.regions,
              }))}`;

          let contacts: Contact[] | null = getCachedContacts(cacheKey);

          if (!contacts) {
            try {
              let res: Response;
              if (useDirectConditions) {
                // Use raw Crustdata conditions with match reason template + AI enrichment
                res = await fetch("/api/find-people", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    conditions: group.crustdataConditions,
                    limit: group.count,
                    matchReasonTemplate: group.matchReasonTemplate,
                    appName: productPage?.name || "My App",
                    description: enrichedDescription,
                  }),
                });
              } else {
                // Fallback to Targeting-based search
                const groupTargeting: Targeting = {
                  industries: group.searchFilters.industries,
                  companySize: targeting?.companySize || { min: 50, max: 5000 },
                  titles: group.searchFilters.titles,
                  regions: group.searchFilters.regions,
                  summary: group.description,
                };
                res = await fetch("/api/find-customers", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ targeting: groupTargeting }),
                });
              }
              const result = await res.json();
              if (result.contacts && result.contacts.length > 0) {
                contacts = result.contacts.slice(0, group.count);
                if (result.dataSource === "live") dataSource = "live";
                setCachedContacts(cacheKey, contacts!);
              }
            } catch (err) {
              console.error(`[loading] Search for "${group.name}" failed:`, err);
              addStepDetail(`Search for ${group.name} failed \u2014 ${err instanceof Error ? err.message : "unknown error"}`);
            }
          } else {
            dataSource = "live";
            contacts = contacts.slice(0, group.count);
          }

          if (contacts && contacts.length > 0) {
            group.contacts = contacts;
            allContacts.push(...contacts);
          }
        }

        if (allContacts.length > 0) {
          const groupSummary = audienceGroups
            .filter((g) => g.contacts && g.contacts.length > 0)
            .map((g) => `${g.contacts!.length} ${g.name.toLowerCase()}`)
            .join(", ");
          addStepDetail(`Found ${allContacts.length} people: ${groupSummary}`);
        }
      }

      // Fallback: try flat targeting search if no audience groups found contacts
      if (allContacts.length === 0 && targeting) {
        const cacheKey = `crustdata_contacts_builder_${hashString(JSON.stringify(targeting))}`;
        let contacts: Contact[] | null = getCachedContacts(cacheKey);

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
          } catch (err) {
            console.error("[loading] Flat targeting search failed:", err);
            addStepDetail(`Contact search failed \u2014 ${err instanceof Error ? err.message : "unknown error"}`);
          }
        } else {
          dataSource = "live";
        }

        if (contacts && contacts.length > 0) {
          allContacts = contacts;
        }
        addStepDetail(allContacts.length > 0 ? `Found ${allContacts.length} people to reach` : "No contacts found \u2014 try adjusting your idea description");
      }

      // ── Step 3b: Find investors, teammates, LinkedIn posts in parallel ──
      setGenStatus("finding_network");
      setStatusMessage("Finding investors, teammates, and relevant posts...");

      let investors: Contact[] | undefined;
      let teammates: Contact[] | undefined;
      let linkedInPosts: LinkedInPost[] | undefined;
      let competitorPosts: LinkedInPost[] | undefined;

      // Extract competitor names from viability analysis
      const competitors = viabilityAnalysis?.dimensions?.competition?.competitors?.map((c) => c.name) || [];
      const detectedCompetitors = competitors;

      const networkBody = {
        description: enrichedDescription,
        appName: productPage?.name || "My App",
        industry: targeting?.industries?.[0] || "Technology",
      };

      // Build competitor posts search alongside other network searches
      const competitorKeywords = competitors.length > 0 ? competitors.slice(0, 5) : [];

      const networkPromises: Promise<unknown>[] = [
        fetch("/api/find-investors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(networkBody),
        }).then((r) => r.json()),
        fetch("/api/find-teammates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(networkBody),
        }).then((r) => r.json()),
        fetch("/api/find-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(networkBody),
        }).then((r) => r.json()),
      ];

      // Add competitor posts search if we have competitor names
      if (competitorKeywords.length > 0) {
        networkPromises.push(
          fetch("/api/find-posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...networkBody,
              competitors: competitorKeywords,
            }),
          }).then((r) => r.json())
        );
      }

      const [investorsResult, teammatesResult, postsResult, competitorPostsResult] = await Promise.allSettled(networkPromises);

      if (investorsResult.status === "fulfilled" && (investorsResult.value as Record<string, unknown>).contacts) {
        const val = investorsResult.value as { contacts: Contact[] };
        if (val.contacts.length > 0) {
          investors = val.contacts;
          addStepDetail(`Found ${val.contacts.length} potential investors`);
        }
      }
      if (teammatesResult.status === "fulfilled" && (teammatesResult.value as Record<string, unknown>).contacts) {
        const val = teammatesResult.value as { contacts: Contact[] };
        if (val.contacts.length > 0) {
          teammates = val.contacts;
          addStepDetail(`Found ${val.contacts.length} potential teammates`);
        }
      }
      if (postsResult.status === "fulfilled" && (postsResult.value as Record<string, unknown>).posts) {
        const val = postsResult.value as { posts: LinkedInPost[] };
        if (val.posts.length > 0) {
          linkedInPosts = val.posts;
          addStepDetail(`Found ${val.posts.length} relevant LinkedIn posts`);
        }
      }
      if (competitorPostsResult?.status === "fulfilled" && (competitorPostsResult.value as Record<string, unknown>).posts) {
        const val = competitorPostsResult.value as { posts: LinkedInPost[] };
        if (val.posts.length > 0) {
          competitorPosts = val.posts;
          addStepDetail(`Found ${val.posts.length} competitor mention posts`);
        }
      }

      // ── Step 4: Create go-to-market content + playbooks ──────────
      setGenStatus("creating_content");
      setStatusMessage("Creating your go-to-market plan...");

      let emailDrafts: EmailDraft[] = [];
      let playbooks: import("@/lib/types").GrowthPlaybook[] | undefined;
      let seoAudit: import("@/lib/types").SEOAudit | undefined;

      try {
        // Run content generation, playbooks, and optionally SEO audit in parallel
        const gtmPromises: Promise<unknown>[] = [
          fetch("/api/generate-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: enrichedDescription,
              appName: productPage?.name || "My App",
              shareUrl: productPage?.shareUrl || "",
              audienceGroups: audienceGroups || [],
              viabilityAnalysis,
              contacts: allContacts,
            }),
          }).then((r) => r.json()),
          fetch("/api/generate-playbooks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: enrichedDescription,
              appName: productPage?.name || "My App",
              industry: targeting?.industries?.[0] || "Technology",
              competitors: detectedCompetitors,
              viabilityAnalysis: viabilityAnalysis ? {
                summary: viabilityAnalysis.summary,
                topOpportunities: viabilityAnalysis.topOpportunities,
              } : undefined,
            }),
          }).then((r) => r.json()),
        ];

        const [contentResult, playbooksResult] = await Promise.allSettled(gtmPromises);

        if (contentResult.status === "fulfilled") {
          const result = contentResult.value as Record<string, unknown>;
          if (result.posts && (result.posts as PostTemplate[]).length > 0) {
            posts = result.posts as PostTemplate[];
            setStatusMessage(`Created ${posts.length} post templates`);
          }
          if (result.emailDrafts && (result.emailDrafts as EmailDraft[]).length > 0) {
            emailDrafts = result.emailDrafts as EmailDraft[];
          }
        }

        if (playbooksResult.status === "fulfilled") {
          const result = playbooksResult.value as { playbooks?: import("@/lib/types").GrowthPlaybook[] };
          if (result.playbooks && result.playbooks.length > 0) {
            playbooks = result.playbooks;
            addStepDetail(`Generated ${playbooks.length} growth playbooks`);
          }
        }

        addStepDetail(
          `Created ${posts?.length || 0} post templates and ${emailDrafts.length} email drafts`
        );
      } catch (err) {
        console.error("generate-content fetch failed:", err);
        addStepDetail("Using default outreach templates");
      }

      // ── Done ───────────────────────────────────────────────────────
      setGenStatus("complete");
      setStatusMessage("Your app is ready!");

      const projectUpdate: Record<string, unknown> = {
        contacts: allContacts,
        emailDrafts,
        dataSource,
        stats: {
          contactsFound: allContacts.length,
          emailsSent: 0,
          replies: 0,
          meetingsBooked: 0,
        },
      };
      if (targeting) projectUpdate.targeting = targeting;
      if (productPage) projectUpdate.productPage = productPage;
      if (viabilityAnalysis) projectUpdate.viabilityAnalysis = viabilityAnalysis;
      if (audienceGroups) projectUpdate.audienceGroups = audienceGroups;
      if (posts) projectUpdate.posts = posts;
      if (suggestedQuestions) projectUpdate.suggestedQuestions = suggestedQuestions;
      if (investors) projectUpdate.investors = investors;
      if (teammates) projectUpdate.teammates = teammates;
      if (linkedInPosts) projectUpdate.linkedInPosts = linkedInPosts;
      if (competitorPosts) projectUpdate.competitorPosts = competitorPosts;
      if (detectedCompetitors.length > 0) projectUpdate.detectedCompetitors = detectedCompetitors;
      if (playbooks) projectUpdate.playbooks = playbooks;
      if (seoAudit) projectUpdate.seoAudit = seoAudit;

      updateProject(pid, projectUpdate as Partial<import("@/lib/types").Project>);

      await new Promise((r) => setTimeout(r, 1500));
      router.push(`/project/${pid}`);
    },
    [updateProject, router, animateCode, addStepDetail]
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
        // Generate pitch page via Claude (no mock data)
        let pitchPage: PitchPage | null = null;
        try {
          const pitchRes = await fetch("/api/generate-pitch-page", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description, company }),
          });
          const pitchResult = await pitchRes.json();
          if (pitchResult.pitchPage) pitchPage = pitchResult.pitchPage;
        } catch (err) {
          console.error(`[loading] Pitch page generation failed for ${company}:`, err);
        }

        // Minimal fallback if API fails entirely
        if (!pitchPage) {
          pitchPage = {
            targetCompany: company,
            headline: `Built for ${company}`,
            subtitle: description,
            problemPoints: [],
            solutionMockups: [],
            urgencySignals: [],
            ctaText: "Book a Demo",
            shareUrl: `/d/${company.toLowerCase().replace(/\s+/g, "-")}`,
          };
        }

        // Search for real contacts at this company
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
          } catch (err) {
            console.error(`[loading] Contact search failed for ${company}:`, err);
          }
        }

        allPitchPages.push(pitchPage);
        if (contacts && contacts.length > 0) {
          allContacts.push(...contacts);
        }
      }

      // Generate email drafts via API for found contacts
      if (allContacts.length > 0) {
        try {
          const emailRes = await fetch("/api/generate-emails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "seller",
              context: { description, shareUrl: allPitchPages[0]?.shareUrl || "" },
              contacts: allContacts.slice(0, 5),
            }),
          });
          const emailResult = await emailRes.json();
          if (emailResult.drafts && emailResult.drafts.length > 0) {
            allDrafts.push(...emailResult.drafts);
          }
        } catch (err) {
          console.error("[loading] Email generation failed:", err);
        }
      }

      updateProject(pid, {
        contacts: allContacts,
        emailDrafts: allDrafts,
        pitchPages: allPitchPages,
        targetCompanies: allPitchPages.map((pp) => pp.targetCompany),
        dataSource: anyLiveData ? "live" : "error",
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
      router.push("/create");
      return;
    }

    if (proj.mode === "builder") {
      runBuilderFlow(projectId, proj.description, proj.source, proj.externalAppUrl);
    } else {
      runSellerFlow(projectId, proj.description, proj.targetCompanies || []);
    }
  }, [projectId, getProject, router, hydrate, runBuilderFlow, runSellerFlow]);

  // Builder mode: show code generation UI
  if (isBuilder) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          <CodeGeneration
            streamedCode={streamedCode}
            status={genStatus}
            statusMessage={statusMessage}
            appName={appName}
            appTagline={appTagline}
            reactCode={reactCode}
            steps={getBuilderSteps(project?.source)}
          />
          {/* Step completion details */}
          {stepDetails.length > 0 && (
            <div className="mt-4 space-y-1.5">
              {stepDetails.map((detail, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                  <span className="text-brand-success mt-0.5">\u2713</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>
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
