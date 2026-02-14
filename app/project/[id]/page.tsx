"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { ContactList } from "@/components/ContactList";
import { TargetingEditor } from "@/components/TargetingEditor";
import { LandingPagePreview } from "@/components/LandingPagePreview";
import { AppBuilder } from "@/components/AppBuilder";
import { ViabilityScore } from "@/components/ViabilityScore";
import { PitchPagePreview } from "@/components/PitchPagePreview";
import { CompanyTabs } from "@/components/CompanyTabs";
import { EmailComposer } from "@/components/EmailComposer";
import { useAppStore } from "@/lib/store";
import { uniqueCompanies } from "@/lib/utils";
import { PostCard } from "@/components/PostCard";
import { CompetitorPills } from "@/components/CompetitorPills";
import { CompanyCard } from "@/components/CompanyCard";
import { FounderCard } from "@/components/FounderCard";
import { ConversationsTab } from "@/components/ConversationsTab";
import type { Contact, EmailDraft, Targeting, PitchPage, PostTemplate, Conversation, LinkedInPost, ProjectGoal } from "@/lib/types";
import { generateId } from "@/lib/utils";

function buildDeployHtml(code: string): string {
  // Strip imports/exports
  let cleaned = code;
  cleaned = cleaned.replace(/^import\s+.*?[\r\n]+/gm, "");
  cleaned = cleaned.replace(/export\s+default\s+function\s+/g, "function ");
  cleaned = cleaned.replace(/export\s+default\s+\w+\s*;?\s*$/gm, "");
  cleaned = cleaned.replace(/export\s+function\s+/g, "function ");
  cleaned = cleaned.replace(/export\s+const\s+/g, "const ");
  cleaned = cleaned.replace(/^export\s+/gm, "");

  const escaped = cleaned.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Landing Page</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin><\/script>
  <script src="https://unpkg.com/@babel/standalone@7.26.10/babel.min.js" crossorigin><\/script>
  <script>
    function Button(props) {
      var variant = props.variant || 'default';
      var baseClass = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
      var cls = variant === 'outline' ? 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm' : 'bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-sm';
      return React.createElement('button', Object.assign({}, props, { className: (baseClass + ' ' + cls + ' ' + (props.className || '')).trim() }), props.children);
    }
    function Input(props) {
      return React.createElement('input', Object.assign({ className: 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ' + (props.className || '') }, props));
    }

    function waitForDeps() {
      return new Promise(function(resolve) {
        function check() {
          if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' && typeof Babel !== 'undefined') resolve();
          else setTimeout(check, 50);
        }
        check();
      });
    }

    async function main() {
      await waitForDeps();
      var rawCode = \\\`${escaped}\\\`;
      try {
        var transpiled = Babel.transform(rawCode, { presets: ['react'], filename: 'App.jsx' }).code;
        var moduleExports = {};
        var wrappedCode = '(function(React, exports, Button, Input) {' +
          'var {useState, useEffect, useRef, useCallback, useMemo} = React;\\n' +
          transpiled + '\\n' +
          'if (typeof App !== "undefined") exports.default = App;\\n' +
          '})';
        eval(wrappedCode)(React, moduleExports, Button, Input);
        var AppComponent = moduleExports.default;
        if (AppComponent) {
          ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AppComponent));
        }
      } catch(e) {
        document.getElementById('root').innerHTML = '<div style="padding:20px;color:red">Error: ' + e.message + '</div>';
      }
    }
    main();
  <\/script>
</body>
</html>`;
}

function LinkedInPostCard({ post }: { post: LinkedInPost }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.suggestedComment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedContent = post.postContent.length > 300 && !expanded
    ? post.postContent.slice(0, 300) + "..."
    : post.postContent;

  return (
    <Card className="p-5">
      {/* Author header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
          {post.authorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm truncate">{post.authorName}</p>
          <p className="text-xs text-gray-500 truncate">{post.authorTitle}{post.authorCompany ? ` at ${post.authorCompany}` : ""}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {post.relevanceScore !== undefined && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              post.relevanceScore >= 8 ? "bg-green-100 text-green-700" :
              post.relevanceScore >= 6 ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-500"
            }`}>
              {post.relevanceScore}/10
            </span>
          )}
          {post.postDate && (
            <span className="text-xs text-gray-400">{post.postDate}</span>
          )}
        </div>
      </div>

      {/* Post content */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{truncatedContent}</p>
        {post.postContent.length > 300 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-brand-primary font-medium mt-1 hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Engagement metrics */}
      {(post.likes !== undefined || post.comments !== undefined) && (
        <div className="flex gap-4 text-xs text-gray-400 mb-3 pb-3 border-b border-gray-100">
          {post.likes !== undefined && <span>{"\u{1F44D}"} {post.likes}</span>}
          {post.comments !== undefined && <span>{"\u{1F4AC}"} {post.comments}</span>}
        </div>
      )}

      {/* AI analysis */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Why this matters</p>
          <p className="text-sm text-gray-700">{post.whyRelevant}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Comment strategy</p>
          <p className="text-sm text-gray-700">{post.commentStrategy}</p>
        </div>
        {post.suggestedComment && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Suggested comment</p>
              <button
                onClick={handleCopy}
                className="text-xs text-brand-primary font-medium hover:underline"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic">
              {post.suggestedComment}
            </div>
          </div>
        )}
      </div>

      {/* View post link */}
      {post.postUrl && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-brand-primary hover:underline"
          >
            View Post on LinkedIn {"\u2192"}
          </a>
        </div>
      )}
    </Card>
  );
}

const BUILDER_TABS = [
  { key: "app" as const, label: "Your App" },
  { key: "people" as const, label: "People to Reach" },
  { key: "conversations" as const, label: "Conversations" },
  { key: "content" as const, label: "Go-to-Market Content" },
];

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getProject, updateProject, setContacts, setTargeting, setPitchPages, updateEmailDraft, markDraftStatus, addConversation, updatePMFScore, hydrate } = useAppStore();
  const [hydrated, setHydrated] = useState(false);
  const [activeCompany, setActiveCompany] = useState("");
  const [composerContactId, setComposerContactId] = useState<string | null>(null);
  const [activeAudienceGroup, setActiveAudienceGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"app" | "people" | "conversations" | "content">("app");
  const [peopleSubTab, setPeopleSubTab] = useState<"customers" | "investors" | "teammates" | "linkedin">("customers");
  const [linkedInSubTab, setLinkedInSubTab] = useState<"relevant" | "competitors">("relevant");
  const [editingCompetitors, setEditingCompetitors] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [refetchingCompetitorPosts, setRefetchingCompetitorPosts] = useState(false);
  const [contactsView, setContactsView] = useState<"people" | "companies">("people");
  const [enrichedCompanyData, setEnrichedCompanyData] = useState<Record<string, {
    linkedinLogoUrl?: string; website?: string; hq?: string;
    totalFunding?: number; headcount?: number; headcountGrowth?: number; industry?: string;
  }>>({});
  const [enrichingCompanies, setEnrichingCompanies] = useState(false);
  const [founderUrl, setFounderUrl] = useState("");
  const [addingFounder, setAddingFounder] = useState(false);
  const [analyzingFounders, setAnalyzingFounders] = useState(false);
  const [regeneratingLanding, setRegeneratingLanding] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [generatingLanding, setGeneratingLanding] = useState(false);
  const [landingError, setLandingError] = useState<string | null>(null);
  const [rerunningGoal, setRerunningGoal] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  const project = getProject(id);

  useEffect(() => {
    if (hydrated && !project) {
      router.push("/create");
    }
  }, [hydrated, project, router]);

  // Derive company names from pitch pages (canonical source of truth)
  const sellerCompanies = useMemo(
    () => project?.pitchPages?.map((p) => p.targetCompany) ?? [],
    [project?.pitchPages]
  );

  useEffect(() => {
    if (project?.mode === "seller" && sellerCompanies.length > 0 && !activeCompany) {
      setActiveCompany(sellerCompanies[0]);
    }
  }, [sellerCompanies, activeCompany, project?.mode]);

  // Set initial audience group
  useEffect(() => {
    if (project?.audienceGroups && project.audienceGroups.length > 0 && !activeAudienceGroup) {
      setActiveAudienceGroup(project.audienceGroups[0].id);
    }
  }, [project?.audienceGroups, activeAudienceGroup]);

  const handleWriteEmail = useCallback((contact: Contact) => {
    setComposerContactId(contact.id);

    if ((!contact.email || !contact.profilePhotoUrl) && contact.linkedinUrl && project) {
      fetch("/api/enrich-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrls: [contact.linkedinUrl] }),
      })
        .then((res) => res.json())
        .then((result) => {
          const match = result.enriched?.find(
            (e: { linkedinUrl: string; email?: string; profilePhotoUrl?: string }) => e.linkedinUrl === contact.linkedinUrl
          );
          if (match?.email || match?.profilePhotoUrl) {
            const updated = project.contacts.map((c) =>
              c.id === contact.id
                ? {
                    ...c,
                    ...(match.email && !c.email ? { email: match.email } : {}),
                    ...(match.profilePhotoUrl && !c.profilePhotoUrl ? { profilePhotoUrl: match.profilePhotoUrl } : {}),
                  }
                : c
            );
            setContacts(project.id, updated);
          }
        })
        .catch(() => {});
    }
  }, [project, setContacts]);

  const handleTargetingChange = useCallback((targeting: Targeting) => {
    if (project) setTargeting(project.id, targeting);
  }, [project, setTargeting]);

  const handleTargetingUpdate = useCallback(() => {
    // TODO: Re-fetch contacts based on updated targeting
  }, []);



  const handlePitchPageUpdate = useCallback((page: PitchPage) => {
    if (!project?.pitchPages) return;
    const updated = project.pitchPages.map((p) =>
      p.targetCompany === page.targetCompany ? page : p
    );
    setPitchPages(project.id, updated);
  }, [project, setPitchPages]);

  const handleDraftUpdate = useCallback((contactId: string, updates: Partial<EmailDraft>) => {
    if (project) updateEmailDraft(project.id, contactId, updates);
  }, [project, updateEmailDraft]);

  const handleMarkDrafted = useCallback((contactId: string) => {
    if (project) markDraftStatus(project.id, contactId, "drafted");
  }, [project, markDraftStatus]);

  const handlePostUpdate = useCallback((updated: PostTemplate) => {
    if (!project?.posts) return;
    const newPosts = project.posts.map((p) => p.id === updated.id ? updated : p);
    updateProject(project.id, { posts: newPosts });
  }, [project, updateProject]);

  const handleAddConversation = useCallback(async (transcript: string, contactId?: string) => {
    if (!project) return;
    const contact = contactId ? project.contacts.find((c) => c.id === contactId) : undefined;
    const appName = project.productPage?.name || project.title;

    const res = await fetch("/api/analyze-conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        appName,
        description: project.description,
        existingConversations: project.conversations || [],
      }),
    });
    const result = await res.json();

    if (result.analysis) {
      const conversation: Conversation = {
        id: generateId(),
        projectId: project.id,
        date: new Date().toISOString(),
        contactId,
        contactName: contact?.name,
        source: "notes",
        transcript,
        analysis: result.analysis,
      };
      addConversation(project.id, conversation);

      if (result.pmfScore) {
        updatePMFScore(project.id, result.pmfScore);
      }
    }
  }, [project, addConversation, updatePMFScore]);

  const handleReEvaluate = useCallback(async () => {
    if (!project || !project.conversations || project.conversations.length < 3) return;
    const appName = project.productPage?.name || project.title;

    const res = await fetch("/api/re-evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversations: project.conversations,
        appName,
        description: project.description,
      }),
    });
    const result = await res.json();

    if (result.pmfScore) {
      updatePMFScore(project.id, result.pmfScore);
    }
  }, [project, updatePMFScore]);

  // Group contacts by company for company view
  const companyGroups = useMemo(() => {
    if (!project) return [];
    const map = new Map<string, Contact[]>();
    for (const c of project.contacts) {
      const key = c.company || "Unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries())
      .map(([name, contacts]) => ({ name, contacts }))
      .sort((a, b) => b.contacts.length - a.contacts.length);
  }, [project?.contacts]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompetitorsChanged = useCallback(async (updated: string[]) => {
    if (!project) return;
    updateProject(id, {
      detectedCompetitors: updated,
      ...(project.importedAnalysis ? { importedAnalysis: { ...project.importedAnalysis, competitors: updated } } : {}),
    });

    // Re-fetch competitor posts
    if (updated.length > 0) {
      setRefetchingCompetitorPosts(true);
      try {
        const res = await fetch("/api/find-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: project.description,
            appName: project.productPage?.name || project.title,
            industry: project.targeting?.industries?.[0] || "Technology",
            competitors: updated,
            projectGoal: project.projectGoal,
          }),
        });
        const result = await res.json();
        updateProject(id, { competitorPosts: result.posts || [] });
      } catch (err) {
        console.error("Competitor posts re-fetch failed:", err);
      } finally {
        setRefetchingCompetitorPosts(false);
      }
    } else {
      updateProject(id, { competitorPosts: [] });
    }
  }, [project, id, updateProject]);

  if (!hydrated || !project) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isBuilder = project.mode === "builder";
  const activePitchPage = project.pitchPages?.find((p) => p.targetCompany === activeCompany);

  // For builder with audience groups: show contacts for active group
  const activeGroupData = project.audienceGroups?.find((g) => g.id === activeAudienceGroup);
  const builderContacts = activeGroupData?.contacts || project.contacts;

  const activeContacts = isBuilder
    ? builderContacts
    : project.contacts.filter((c) => c.company === activeCompany || project.contacts.every((ct) => ct.company !== activeCompany));

  const composerContact = composerContactId
    ? project.contacts.find((c) => c.id === composerContactId) || null
    : null;
  const composerDraft = composerContactId
    ? project.emailDrafts.find((d) => d.contactId === composerContactId) || null
    : null;

  // ─── Builder Mode Layout ────────────────────────────────────────────────
  if (isBuilder) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {BUILDER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.key === "people" && (project.contacts.length + (project.investors?.length || 0) + (project.teammates?.length || 0)) > 0 && (
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {project.contacts.length + (project.investors?.length || 0) + (project.teammates?.length || 0)}
                </span>
              )}
              {tab.key === "conversations" && project.conversations && project.conversations.length > 0 && (
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {project.conversations.length}
                </span>
              )}
              {tab.key === "content" && project.posts && project.posts.length > 0 && (
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {project.posts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Your App */}
        {activeTab === "app" && (
          <>
            {/* 1. External URL iframe */}
            {project.externalAppUrl && (
              <Card className="p-0 mb-6 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {project.productPage?.name || project.title}
                    </span>
                    {project.productPage?.tagline && (
                      <span className="text-gray-400 text-sm ml-2">
                        {project.productPage.tagline}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => window.open(project.externalAppUrl, "_blank")}
                    className="px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors"
                  >
                    Open Original
                  </button>
                </div>
                <iframe
                  src={project.externalAppUrl}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full border-0"
                  style={{ height: "400px" }}
                  title="App preview"
                />
              </Card>
            )}

            {/* 2. App Builder (shown when no external URL) */}
            {!project.externalAppUrl && (
              <AppBuilder
                projectId={id}
                appCode={project.appCode}
                description={project.description}
                appName={project.productPage?.name || project.title}
                features={project.productPage?.features}
                targetUser={project.importedAnalysis?.targetUser}
                industry={project.importedAnalysis?.industry}
                projectGoal={project.projectGoal}
                appEditHistory={project.appEditHistory}
                onUpdate={(fields) => updateProject(id, fields)}
              />
            )}

            {/* 3. Landing Page Section (below app) */}
            {project.landingPageCode && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Landing Page</h3>
                <Card className="p-0 mb-4 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {project.productPage?.name || project.title}
                      </span>
                      {project.productPage?.tagline && (
                        <span className="text-gray-400 text-sm ml-2">
                          {project.productPage.tagline}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setRegeneratingLanding(true);
                          setLandingError(null);
                          try {
                            const res = await fetch("/api/generate-landing", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                description: project.description,
                                appName: project.productPage?.name || project.title,
                                context: {
                                  description: project.description,
                                  appName: project.productPage?.name,
                                  tagline: project.productPage?.tagline,
                                  features: project.productPage?.features,
                                  targetUser: project.importedAnalysis?.targetUser,
                                  problemSolved: project.importedAnalysis?.problemSolved,
                                  industry: project.importedAnalysis?.industry,
                                  competitors: project.detectedCompetitors || project.importedAnalysis?.competitors,
                                  viabilityScore: project.viabilityAnalysis?.overallScore,
                                  viabilitySummary: project.viabilityAnalysis?.summary,
                                  topOpportunities: project.viabilityAnalysis?.topOpportunities,
                                  projectGoal: project.projectGoal,
                                  founders: project.founders?.map((f) => ({ name: f.name, headline: f.headline })),
                                },
                              }),
                            });
                            const result = await res.json();
                            if (result.code) {
                              updateProject(id, { landingPageCode: result.code });
                            } else if (result.error) {
                              setLandingError(result.error);
                            }
                          } catch (err) {
                            setLandingError(err instanceof Error ? err.message : "Regeneration failed");
                          } finally {
                            setRegeneratingLanding(false);
                          }
                        }}
                        disabled={regeneratingLanding}
                        className="px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors disabled:opacity-50"
                      >
                        {regeneratingLanding ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            Regenerating...
                          </span>
                        ) : "Regenerate"}
                      </button>
                    </div>
                  </div>
                  <LandingPagePreview code={project.landingPageCode} height="600px" />
                </Card>
                {landingError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm mb-4">
                    {landingError}
                  </div>
                )}
                <Card className="p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Deploy Landing Page</h3>
                      <p className="text-xs text-gray-500">Get a standalone HTML file you can host anywhere</p>
                    </div>
                    <button
                      onClick={() => setShowDeployModal(true)}
                      className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                      Deploy Landing Page
                    </button>
                  </div>
                </Card>
              </div>
            )}

            {/* 4. Generate Landing Page (if none exists yet, non-external-url projects) */}
            {!project.landingPageCode && !project.externalAppUrl && (
              <Card className="p-6 mb-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">{"\u{1F3A8}"}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No landing page yet
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                    {landingError || "Generate a beautiful landing page for your product with AI."}
                  </p>
                  <button
                    onClick={async () => {
                      setGeneratingLanding(true);
                      setLandingError(null);
                      try {
                        const res = await fetch("/api/generate-landing", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            description: project.description,
                            appName: project.productPage?.name || project.title,
                            context: {
                              description: project.description,
                              appName: project.productPage?.name,
                              tagline: project.productPage?.tagline,
                              features: project.productPage?.features,
                              targetUser: project.importedAnalysis?.targetUser,
                              problemSolved: project.importedAnalysis?.problemSolved,
                              industry: project.importedAnalysis?.industry,
                              competitors: project.detectedCompetitors || project.importedAnalysis?.competitors,
                              viabilityScore: project.viabilityAnalysis?.overallScore,
                              viabilitySummary: project.viabilityAnalysis?.summary,
                              topOpportunities: project.viabilityAnalysis?.topOpportunities,
                              projectGoal: project.projectGoal,
                              founders: project.founders?.map((f) => ({ name: f.name, headline: f.headline })),
                            },
                          }),
                        });
                        const result = await res.json();
                        if (result.code) {
                          updateProject(id, { landingPageCode: result.code });
                        } else if (result.error) {
                          setLandingError(result.error);
                        }
                      } catch (err) {
                        setLandingError(err instanceof Error ? err.message : "Generation failed");
                      } finally {
                        setGeneratingLanding(false);
                      }
                    }}
                    disabled={generatingLanding}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                  >
                    {generatingLanding ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Landing Page...
                      </span>
                    ) : "Generate Landing Page"}
                  </button>
                </div>
              </Card>
            )}

            {/* Deploy Modal */}
            {showDeployModal && project.landingPageCode && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeployModal(false)}>
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Deploy Landing Page</h2>
                    <button onClick={() => setShowDeployModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-sm text-gray-600 mb-4">
                      Your landing page is a standalone HTML file. Copy the HTML or download it to host anywhere (Netlify, Vercel, GitHub Pages, etc).
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all font-mono">
                        {buildDeployHtml(project.landingPageCode).slice(0, 2000)}
                        {buildDeployHtml(project.landingPageCode).length > 2000 ? "\n\n... (truncated preview)" : ""}
                      </pre>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(buildDeployHtml(project.landingPageCode!));
                        }}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors"
                      >
                        Copy HTML
                      </button>
                      <button
                        onClick={() => {
                          const html = buildDeployHtml(project.landingPageCode!);
                          const blob = new Blob([html], { type: "text/html" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "landing-page.html";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors"
                      >
                        Download as HTML
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Goal Selector */}
            <Card className="p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal</span>
                <div className="flex gap-2">
                  {([
                    { key: 'side_project' as ProjectGoal, label: 'Side Project', icon: '\u{1F9EA}' },
                    { key: 'small_business' as ProjectGoal, label: 'Small Business', icon: '\u{1F3EA}' },
                    { key: 'venture_scale' as ProjectGoal, label: 'Venture Scale', icon: '\u{1F680}' },
                  ]).map((g) => (
                    <button
                      key={g.key}
                      disabled={rerunningGoal}
                      onClick={async () => {
                        if (project.projectGoal === g.key) return;
                        updateProject(id, { projectGoal: g.key });
                        setRerunningGoal(true);
                        try {
                          // Re-run viability analysis with new goal
                          const viabilityRes = await fetch("/api/analyze-viability", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              description: project.description,
                              appName: project.productPage?.name || project.title,
                              projectGoal: g.key,
                            }),
                          });
                          const viabilityResult = await viabilityRes.json();
                          const updates: Record<string, unknown> = {};
                          if (viabilityResult.viabilityAnalysis) {
                            updates.viabilityAnalysis = viabilityResult.viabilityAnalysis;
                          }
                          if (viabilityResult.smartTargeting?.audienceGroups) {
                            updates.audienceGroups = viabilityResult.smartTargeting.audienceGroups;
                          }

                          // Re-run content generation with new goal
                          const contentRes = await fetch("/api/generate-content", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              description: project.description,
                              appName: project.productPage?.name || project.title,
                              shareUrl: project.productPage?.shareUrl || "",
                              audienceGroups: viabilityResult.smartTargeting?.audienceGroups || project.audienceGroups || [],
                              viabilityAnalysis: viabilityResult.viabilityAnalysis || project.viabilityAnalysis,
                              contacts: project.contacts,
                              projectGoal: g.key,
                            }),
                          });
                          const contentResult = await contentRes.json();
                          if (contentResult.posts) updates.posts = contentResult.posts;
                          if (contentResult.emailDrafts) updates.emailDrafts = contentResult.emailDrafts;

                          if (Object.keys(updates).length > 0) {
                            updateProject(id, updates as Partial<typeof project>);
                          }
                        } catch (err) {
                          console.error("Goal re-run failed:", err);
                        } finally {
                          setRerunningGoal(false);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        project.projectGoal === g.key
                          ? "bg-brand-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } disabled:opacity-50`}
                    >
                      {g.icon} {g.label}
                    </button>
                  ))}
                </div>
                {rerunningGoal && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    Re-analyzing...
                  </div>
                )}
              </div>
            </Card>

            {/* Imported Analysis Card */}
            {project.importedAnalysis && (
              <Card className="p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Product Analysis
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-gray-400">Problem Solved</span>
                    <p className="text-sm text-gray-700">{project.importedAnalysis.problemSolved}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400">Target User</span>
                    <p className="text-sm text-gray-700">{project.importedAnalysis.targetUser}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400">Industry</span>
                    <p className="text-sm text-gray-700">{project.importedAnalysis.industry}</p>
                  </div>
                  <CompetitorPills
                    competitors={project.detectedCompetitors || project.importedAnalysis.competitors}
                    editing={editingCompetitors}
                    onToggleEdit={() => setEditingCompetitors(!editingCompetitors)}
                    onRemove={(idx) => {
                      const current = project.detectedCompetitors || [...project.importedAnalysis!.competitors];
                      handleCompetitorsChanged(current.filter((_, i) => i !== idx));
                    }}
                    onAdd={(name) => {
                      const current = project.detectedCompetitors || [...project.importedAnalysis!.competitors];
                      handleCompetitorsChanged([...current, name]);
                    }}
                    loading={refetchingCompetitorPosts}
                  />
                </div>
              </Card>
            )}

            {/* Competitors card (when no importedAnalysis but we have detectedCompetitors) */}
            {!project.importedAnalysis && project.detectedCompetitors && project.detectedCompetitors.length > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Competitors</h3>
                <CompetitorPills
                  competitors={project.detectedCompetitors}
                  editing={editingCompetitors}
                  onToggleEdit={() => setEditingCompetitors(!editingCompetitors)}
                  onRemove={(idx) => {
                    handleCompetitorsChanged(project.detectedCompetitors!.filter((_, i) => i !== idx));
                  }}
                  onAdd={(name) => {
                    handleCompetitorsChanged([...(project.detectedCompetitors || []), name]);
                  }}
                  loading={refetchingCompetitorPosts}
                />
              </Card>
            )}

            {/* Founding Team */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Founding Team
                </h3>
              </div>

              {/* Existing founders */}
              {project.founders && project.founders.length > 0 && (
                <div className="space-y-3 mb-4">
                  {project.founders.map((founder) => (
                    <FounderCard
                      key={founder.id}
                      founder={founder}
                      onRemove={() => {
                        const updated = project.founders!.filter((f) => f.id !== founder.id);
                        updateProject(id, { founders: updated });
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Add founder input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={founderUrl}
                  onChange={(e) => setFounderUrl(e.target.value)}
                  placeholder="Paste LinkedIn URL..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                />
                <button
                  onClick={async () => {
                    if (!founderUrl.trim()) return;
                    setAddingFounder(true);
                    try {
                      const res = await fetch("/api/enrich-founder", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ linkedinUrl: founderUrl.trim() }),
                      });
                      const result = await res.json();
                      if (result.founder) {
                        const existing = project.founders || [];
                        updateProject(id, { founders: [...existing, result.founder] });
                        setFounderUrl("");
                      }
                    } catch (err) {
                      console.error("Founder enrichment failed:", err);
                    } finally {
                      setAddingFounder(false);
                    }
                  }}
                  disabled={addingFounder || !founderUrl.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                >
                  {addingFounder ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : "+ Add Founder"}
                </button>
              </div>

              {/* Generate Growth Checklist */}
              {project.founders && project.founders.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      if (!project.founders || project.founders.length === 0) return;
                      setAnalyzingFounders(true);
                      try {
                        const res = await fetch("/api/analyze-founders", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            founders: project.founders,
                            description: project.description,
                            appName: project.productPage?.name || project.title,
                            projectGoal: project.projectGoal,
                            competitors: project.detectedCompetitors,
                            audienceGroups: project.audienceGroups?.map((g) => ({ name: g.name, count: g.contacts?.length || 0 })),
                            linkedInPosts: project.linkedInPosts?.slice(0, 5),
                            viabilityScore: project.viabilityAnalysis?.overallScore,
                          }),
                        });
                        const result = await res.json();
                        if (result.growthChecklist) {
                          updateProject(id, { growthChecklist: result.growthChecklist });
                        }
                      } catch (err) {
                        console.error("Founder analysis failed:", err);
                      } finally {
                        setAnalyzingFounders(false);
                      }
                    }}
                    disabled={analyzingFounders}
                    className="px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors disabled:opacity-50 w-full"
                  >
                    {analyzingFounders ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        {project.growthChecklist ? "Regenerating checklist..." : "Generating growth checklist..."}
                      </span>
                    ) : project.growthChecklist ? "Regenerate Growth Checklist" : "Generate Growth Checklist"}
                  </button>
                </div>
              )}

              {/* Growth Checklist Results */}
              {project.growthChecklist && project.growthChecklist.sections.length > 0 && (() => {
                const checkedItems = project.growthChecklist!.checkedItems || [];
                const totalItems = project.growthChecklist!.sections.reduce((sum, s) => sum + s.items.length, 0);
                const completedCount = checkedItems.length;
                const sectionIconMap: Record<string, string> = {
                  "this-week": "\u{1F525}",
                  "content-linkedin": "\u{1F4E2}",
                  "network-activation": "\u{1F91D}",
                  "direct-outreach": "\u{1F3AF}",
                  "growth-loops": "\u{1F504}",
                };
                const effortBadge = (effort: string) => {
                  if (effort === "quick") return { icon: "\u26A1", label: "15 min", cls: "bg-green-100 text-green-700" };
                  if (effort === "medium") return { icon: "\u{1F528}", label: "1-2 hrs", cls: "bg-yellow-100 text-yellow-700" };
                  return { icon: "\u{1F4C5}", label: "1 day+", cls: "bg-orange-100 text-orange-700" };
                };

                return (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    {/* Progress */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Growth Checklist</span>
                      <span className="text-xs font-medium text-gray-500">{completedCount}/{totalItems} completed</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all"
                        style={{ width: totalItems > 0 ? `${(completedCount / totalItems) * 100}%` : "0%" }}
                      />
                    </div>

                    {/* Sections */}
                    <div className="space-y-4">
                      {project.growthChecklist!.sections.map((section) => (
                        <div key={section.id}>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            {sectionIconMap[section.id] || "\u{2705}"} {section.title}
                          </h4>
                          <div className="space-y-1">
                            {section.items.map((item, itemIdx) => {
                              const itemKey = `${section.id}-${itemIdx}`;
                              const isChecked = checkedItems.includes(itemKey);
                              const badge = effortBadge(item.effort);

                              return (
                                <div key={itemIdx} className={`flex items-start gap-3 py-2 px-2 rounded-lg transition-colors ${isChecked ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const current = project.growthChecklist?.checkedItems || [];
                                      const updated = isChecked
                                        ? current.filter((k) => k !== itemKey)
                                        : [...current, itemKey];
                                      updateProject(id, {
                                        growthChecklist: { ...project.growthChecklist!, checkedItems: updated },
                                      });
                                    }}
                                    className="mt-1 shrink-0 accent-brand-primary"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-sm font-medium ${isChecked ? "line-through text-gray-400" : "text-gray-900"}`}>
                                        {item.text}
                                      </span>
                                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${badge.cls}`}>
                                        {badge.icon} {badge.label}
                                      </span>
                                      {item.linkTo && (
                                        <button
                                          onClick={() => {
                                            if (item.linkTo === "people") { setActiveTab("people"); }
                                            else if (item.linkTo === "linkedin") { setActiveTab("people"); setPeopleSubTab("linkedin"); }
                                            else if (item.linkTo === "content") { setActiveTab("content"); }
                                          }}
                                          className="text-[10px] font-medium text-brand-primary hover:underline"
                                        >
                                          {item.linkTo === "people" ? "People tab" : item.linkTo === "linkedin" ? "LinkedIn tab" : "Content tab"} {"\u2192"}
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.why}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Posts to engage with right now */}
                    {project.linkedInPosts && project.linkedInPosts.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          {"\u{1F4CC}"} Posts to Engage With Right Now
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">Live posts from your LinkedIn tab that match your checklist:</p>
                        <div className="space-y-2">
                          {project.linkedInPosts.slice(0, 3).map((post, i) => (
                            <div key={i} className="flex items-start gap-3 py-2 px-2 bg-purple-50/50 rounded-lg">
                              <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-[10px] shrink-0">
                                {post.authorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">{post.authorName} &middot; {post.authorTitle}</p>
                                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{post.postContent.slice(0, 120)}...</p>
                                {post.suggestedComment && (
                                  <p className="text-xs text-purple-700 italic mt-1 line-clamp-1">&ldquo;{post.suggestedComment.slice(0, 100)}...&rdquo;</p>
                                )}
                                <div className="flex gap-2 mt-1">
                                  {post.postUrl && (
                                    <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium text-brand-primary hover:underline">
                                      View Post {"\u2192"}
                                    </a>
                                  )}
                                  <button
                                    onClick={() => { setActiveTab("people"); setPeopleSubTab("linkedin"); }}
                                    className="text-[10px] font-medium text-gray-500 hover:underline"
                                  >
                                    See all posts
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </Card>

            {/* Viability Analysis */}
            {project.viabilityAnalysis ? (
              <Card className="p-6">
                <ViabilityScore analysis={project.viabilityAnalysis} />
              </Card>
            ) : (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Targeting
                </h2>
                <TargetingEditor
                  targeting={project.targeting}
                  onChange={handleTargetingChange}
                  onUpdate={handleTargetingUpdate}
                />
              </Card>
            )}

            {/* SEO & AEO Audit */}
            {project.externalAppUrl && (
              <Card className="p-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    SEO & AEO Audit
                  </h3>
                  {!project.seoAudit && !seoLoading && (
                    <button
                      onClick={async () => {
                        setSeoLoading(true);
                        try {
                          const res = await fetch("/api/seo-audit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              url: project.externalAppUrl,
                              appName: project.productPage?.name || project.title,
                              description: project.description,
                            }),
                          });
                          const result = await res.json();
                          if (result.audit) {
                            updateProject(id, { seoAudit: result.audit });
                          }
                        } catch (err) {
                          console.error("SEO audit failed:", err);
                        } finally {
                          setSeoLoading(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors"
                    >
                      Run Audit
                    </button>
                  )}
                  {seoLoading && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  )}
                </div>

                {project.seoAudit ? (
                  <div>
                    {/* Score */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`text-3xl font-bold ${
                        project.seoAudit.score >= 80 ? "text-green-600" :
                        project.seoAudit.score >= 60 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {project.seoAudit.score}/100
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            project.seoAudit.score >= 80 ? "bg-green-500" :
                            project.seoAudit.score >= 60 ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${project.seoAudit.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Checks */}
                    <div className="space-y-1.5 mb-4">
                      {project.seoAudit.checks.map((check, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="shrink-0 mt-0.5">
                            {check.status === "pass" ? "\u2705" : check.status === "warning" ? "\u26A0\uFE0F" : "\u274C"}
                          </span>
                          <div>
                            <span className="font-medium text-gray-800">{check.item}</span>
                            <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded uppercase ${
                              check.category === "aeo" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {check.category}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    {project.seoAudit.recommendations.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {project.seoAudit.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-brand-primary shrink-0">&bull;</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tool suggestions */}
                    {project.seoAudit.toolSuggestions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suggested Tools</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {project.seoAudit.toolSuggestions.map((tool, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : !seoLoading ? (
                  <p className="text-sm text-gray-500">
                    Run an audit to check your site&apos;s SEO and AI search engine optimization.
                  </p>
                ) : null}
              </Card>
            )}
          </>
        )}

        {/* Tab 2: People to Reach */}
        {activeTab === "people" && (
          <div>
            {/* Sub-tab navigation */}
            <div className="flex gap-1 mb-4 flex-wrap">
              {[
                { key: "customers" as const, label: "Users & Customers", icon: "\u{1F465}" },
                ...(project.projectGoal !== 'side_project' ? [{ key: "investors" as const, label: project.projectGoal === 'small_business' ? "Angels & Advisors" : "Investors", icon: "\u{1F4B0}" }] : []),
                { key: "teammates" as const, label: "Teammates", icon: "\u{1F91D}" },
                { key: "linkedin" as const, label: "LinkedIn Posts", icon: "\u{1F4AC}" },
              ].map((sub) => (
                <button
                  key={sub.key}
                  onClick={() => setPeopleSubTab(sub.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    peopleSubTab === sub.key
                      ? "bg-brand-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="mr-1.5">{sub.icon}</span>
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-tab: Users & Customers */}
            {peopleSubTab === "customers" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Who to Reach Out To
                  </h2>
                  <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setContactsView("people")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        contactsView === "people" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      }`}
                    >
                      People
                    </button>
                    <button
                      onClick={() => setContactsView("companies")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        contactsView === "companies" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                      }`}
                    >
                      Companies
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {project.contacts.length} people across {uniqueCompanies(project.contacts)} companies
                </p>

                {/* Data source indicator */}
                {project.dataSource === "error" && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm mb-4">
                    Crustdata API error &mdash; some contacts may be missing. Try creating a new project to retry.
                  </div>
                )}
                {project.dataSource === "live" && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm mb-4">
                    Live data from 700M+ professional profiles
                  </div>
                )}

                {/* Audience group tabs */}
                {project.audienceGroups && project.audienceGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setActiveAudienceGroup(null)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        !activeAudienceGroup
                          ? "bg-brand-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All ({project.contacts.length})
                    </button>
                    {project.audienceGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => setActiveAudienceGroup(group.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                          activeAudienceGroup === group.id
                            ? "bg-brand-primary text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {group.name} ({group.contacts?.length || 0})
                      </button>
                    ))}
                  </div>
                )}

                {/* Active group description */}
                {activeGroupData && (
                  <p className="text-xs text-gray-500 mb-3 italic">
                    {activeGroupData.description}
                  </p>
                )}

                {contactsView === "people" ? (
                  <ContactList
                    contacts={activeAudienceGroup === null ? project.contacts : activeContacts}
                    onWriteEmail={handleWriteEmail}
                    emailDrafts={project.emailDrafts}
                  />
                ) : (
                  <div>
                    {/* Enrich button */}
                    <div className="flex justify-end mb-3">
                      <button
                        onClick={async () => {
                          setEnrichingCompanies(true);
                          try {
                            const names = companyGroups.slice(0, 20).map((g) => g.name);
                            const res = await fetch("/api/enrich-companies", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ companyNames: names }),
                            });
                            const result = await res.json();
                            if (result.companies) {
                              setEnrichedCompanyData((prev) => ({ ...prev, ...result.companies }));
                            }
                          } catch (err) {
                            console.error("Company enrichment failed:", err);
                          } finally {
                            setEnrichingCompanies(false);
                          }
                        }}
                        disabled={enrichingCompanies}
                        className="px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors disabled:opacity-50"
                      >
                        {enrichingCompanies ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            Enriching...
                          </span>
                        ) : "Enrich Companies"}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {companyGroups.map((group) => {
                        const enriched = enrichedCompanyData[group.name];
                        return (
                          <CompanyCard
                            key={group.name}
                            name={group.name}
                            contacts={group.contacts}
                            industry={enriched?.industry || group.contacts[0]?.industry}
                            headcount={enriched?.headcount || group.contacts[0]?.companySize}
                            hq={enriched?.hq}
                            website={enriched?.website}
                            logoUrl={enriched?.linkedinLogoUrl}
                            totalFunding={enriched?.totalFunding}
                            headcountGrowth={enriched?.headcountGrowth}
                            onWriteEmail={handleWriteEmail}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Sub-tab: Investors */}
            {peopleSubTab === "investors" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Investors
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  VCs, angels, and fund partners who invest in your space
                </p>

                {project.dataSource === "live" && project.investors && project.investors.length > 0 && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm mb-4">
                    Live data from 700M+ professional profiles
                  </div>
                )}

                {project.investors && project.investors.length > 0 ? (
                  <ContactList
                    contacts={project.investors}
                    onWriteEmail={handleWriteEmail}
                    emailDrafts={project.emailDrafts}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">{"\u{1F4C8}"}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      No investors found. Try re-running the analysis with a more specific description.
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Sub-tab: Teammates */}
            {peopleSubTab === "teammates" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Teammates
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  Engineers, designers, and operators for your founding team
                </p>

                {project.dataSource === "live" && project.teammates && project.teammates.length > 0 && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm mb-4">
                    Live data from 700M+ professional profiles
                  </div>
                )}

                {project.teammates && project.teammates.length > 0 ? (
                  <ContactList
                    contacts={project.teammates}
                    onWriteEmail={handleWriteEmail}
                    emailDrafts={project.emailDrafts}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">{"\u{1F9D1}\u{200D}\u{1F4BB}"}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      No teammates found. Try re-running the analysis with a more specific description.
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* Sub-tab: LinkedIn Posts */}
            {peopleSubTab === "linkedin" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  LinkedIn Posts
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Engage with people already talking about your space
                </p>

                {/* LinkedIn sub-tabs: Relevant Posts / Competitor Mentions */}
                {(project.competitorPosts && project.competitorPosts.length > 0) && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setLinkedInSubTab("relevant")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        linkedInSubTab === "relevant"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Relevant Posts {project.linkedInPosts?.length ? `(${project.linkedInPosts.length})` : ""}
                    </button>
                    <button
                      onClick={() => setLinkedInSubTab("competitors")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        linkedInSubTab === "competitors"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Competitor Mentions {project.competitorPosts?.length ? `(${project.competitorPosts.length})` : ""}
                    </button>
                  </div>
                )}

                {/* Relevant Posts */}
                {linkedInSubTab === "relevant" && (
                  <>
                    {project.linkedInPosts && project.linkedInPosts.length > 0 ? (
                      <div className="space-y-4">
                        {project.linkedInPosts.map((post) => (
                          <LinkedInPostCard key={post.id} post={post} />
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">{"\u{1F4AC}"}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          No LinkedIn posts found. Try re-running the analysis with a more specific description.
                        </p>
                      </Card>
                    )}
                  </>
                )}

                {/* Competitor Mentions */}
                {linkedInSubTab === "competitors" && (
                  <>
                    {project.detectedCompetitors && project.detectedCompetitors.length > 0 && (
                      <div className="mb-4">
                        <CompetitorPills
                          competitors={project.detectedCompetitors}
                          editing={editingCompetitors}
                          onToggleEdit={() => setEditingCompetitors(!editingCompetitors)}
                          onRemove={(idx) => {
                            handleCompetitorsChanged(project.detectedCompetitors!.filter((_, i) => i !== idx));
                          }}
                          onAdd={(name) => {
                            handleCompetitorsChanged([...(project.detectedCompetitors || []), name]);
                          }}
                          variant="orange"
                          loading={refetchingCompetitorPosts}
                        />
                      </div>
                    )}
                    {project.competitorPosts && project.competitorPosts.length > 0 ? (
                      <div className="space-y-4">
                        {project.competitorPosts.map((post) => (
                          <LinkedInPostCard key={post.id} post={post} />
                        ))}
                      </div>
                    ) : (
                      <Card className="p-8 text-center">
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">{"\u{1F50D}"}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          No competitor mentions found.
                          {!project.detectedCompetitors?.length && " Add competitors in the Product Analysis card to search for mentions."}
                        </p>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Conversations */}
        {activeTab === "conversations" && (
          <ConversationsTab
            project={project}
            onAddConversation={handleAddConversation}
            onReEvaluate={handleReEvaluate}
          />
        )}

        {/* Tab 4: Go-to-Market Content */}
        {activeTab === "content" && (
          <div>
            {/* Posts */}
            {project.posts && project.posts.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Launch Playbook
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {project.posts.length} ready-to-post templates for your launch
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {project.posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onUpdate={handlePostUpdate}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500 text-sm">
                  No post templates generated yet. Re-run the analysis to generate go-to-market content.
                </p>
              </Card>
            )}

            {/* Email drafts summary */}
            {project.emailDrafts.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Email Drafts
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  {project.emailDrafts.length} personalized emails ready to send
                </p>
                <Card className="p-4">
                  <div className="space-y-3">
                    {project.emailDrafts.slice(0, 4).map((draft) => {
                      const contact = project.contacts.find((c) => c.id === draft.contactId);
                      return (
                        <div
                          key={draft.contactId}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {contact?.name || "Unknown"} — {contact?.company}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {draft.subject}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (contact) handleWriteEmail(contact);
                            }}
                            className="ml-3 px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors shrink-0"
                          >
                            Open
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {project.emailDrafts.length > 4 && (
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      + {project.emailDrafts.length - 4} more drafts &mdash; switch to &ldquo;People to Reach&rdquo; tab to see all
                    </p>
                  )}
                </Card>
              </div>
            )}

            {/* Growth Playbooks */}
            {project.playbooks && project.playbooks.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Growth Playbooks
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Step-by-step strategies tailored to your product
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {project.playbooks.map((playbook) => (
                    <Card key={playbook.id} className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-2xl">{playbook.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{playbook.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{playbook.description}</p>
                        </div>
                      </div>
                      <ol className="space-y-2 mb-3">
                        {playbook.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                      <p className="text-xs text-gray-400 italic">{playbook.relevance}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Email Composer */}
        <EmailComposer
          draft={composerDraft}
          contact={composerContact}
          contacts={project.contacts}
          onClose={() => setComposerContactId(null)}
          onNavigate={(contactId) => setComposerContactId(contactId)}
          onUpdateDraft={handleDraftUpdate}
          onMarkDrafted={handleMarkDrafted}
        />
      </div>
    );
  }

  // ─── Seller Mode Layout (unchanged) ─────────────────────────────────────
  return (
    <div className="max-w-results mx-auto px-4 py-8">
      {sellerCompanies.length > 1 && (
        <CompanyTabs
          companies={sellerCompanies}
          active={activeCompany}
          onChange={setActiveCompany}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          {activePitchPage && (
            <PitchPagePreview
              page={activePitchPage}
              onUpdate={handlePitchPageUpdate}
            />
          )}
        </Card>

        <Card className="p-6">
          <ContactList
            contacts={activeContacts}
            onWriteEmail={handleWriteEmail}
            groupByRole
            companyName={activeCompany}
            emailDrafts={project.emailDrafts}
          />
        </Card>
      </div>

      <EmailComposer
        draft={composerDraft}
        contact={composerContact}
        contacts={activeContacts}
        onClose={() => setComposerContactId(null)}
        onNavigate={(contactId) => setComposerContactId(contactId)}
        onUpdateDraft={handleDraftUpdate}
        onMarkDrafted={handleMarkDrafted}
      />
    </div>
  );
}
