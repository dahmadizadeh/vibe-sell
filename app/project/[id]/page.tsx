"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { ContactList } from "@/components/ContactList";
import { TargetingEditor } from "@/components/TargetingEditor";
import { ProductPagePreview } from "@/components/ProductPagePreview";
import { AppPreview } from "@/components/AppPreview";
import { ViabilityScore } from "@/components/ViabilityScore";
import { PitchPagePreview } from "@/components/PitchPagePreview";
import { CompanyTabs } from "@/components/CompanyTabs";
import { EmailComposer } from "@/components/EmailComposer";
import { useAppStore } from "@/lib/store";
import { uniqueCompanies } from "@/lib/utils";
import { PostCard } from "@/components/PostCard";
import { ConversationsTab } from "@/components/ConversationsTab";
import type { Contact, EmailDraft, Targeting, ProductPage, PitchPage, PostTemplate, Conversation, LinkedInPost } from "@/lib/types";
import { generateId } from "@/lib/utils";

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
        {post.postDate && (
          <span className="text-xs text-gray-400 shrink-0">{post.postDate}</span>
        )}
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
  const { getProject, updateProject, setContacts, setTargeting, setProductPage, setPitchPages, updateEmailDraft, markDraftStatus, addConversation, updatePMFScore, hydrate } = useAppStore();
  const [hydrated, setHydrated] = useState(false);
  const [activeCompany, setActiveCompany] = useState("");
  const [composerContactId, setComposerContactId] = useState<string | null>(null);
  const [activeAudienceGroup, setActiveAudienceGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"app" | "people" | "conversations" | "content">("app");
  const [peopleSubTab, setPeopleSubTab] = useState<"customers" | "investors" | "teammates" | "linkedin">("customers");
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [addUrlValue, setAddUrlValue] = useState("");
  const [linkedInSubTab, setLinkedInSubTab] = useState<"relevant" | "competitors">("relevant");
  const [editingCompetitors, setEditingCompetitors] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [seoLoading, setSeoLoading] = useState(false);

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

    if (!contact.email && contact.linkedinUrl && project) {
      fetch("/api/enrich-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrls: [contact.linkedinUrl] }),
      })
        .then((res) => res.json())
        .then((result) => {
          const match = result.enriched?.find(
            (e: { linkedinUrl: string; email?: string }) => e.linkedinUrl === contact.linkedinUrl
          );
          if (match?.email) {
            const updated = project.contacts.map((c) =>
              c.id === contact.id ? { ...c, email: match.email } : c
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

  const handleProductPageUpdate = useCallback((page: ProductPage) => {
    if (project) setProductPage(project.id, page);
  }, [project, setProductPage]);

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
            {/* External URL iframe */}
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

            {/* Generated React code (no external URL) */}
            {!project.externalAppUrl && project.productPage?.reactCode && (
              <Card className="p-0 mb-6 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {project.productPage.name}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      {project.productPage.tagline}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(project.productPage!.shareUrl, "_blank")}
                      className="px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors"
                    >
                      Open Full Screen
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}${project.productPage!.shareUrl}`;
                        navigator.clipboard.writeText(url);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
                <AppPreview code={project.productPage.reactCode} height="400px" />
              </Card>
            )}

            {/* Description only (no URL, no reactCode) */}
            {project.source === 'description' && !project.externalAppUrl && !project.productPage?.reactCode && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {project.productPage?.name || project.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{project.description}</p>
                {!showAddUrl ? (
                  <button
                    onClick={() => setShowAddUrl(true)}
                    className="px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors"
                  >
                    Add URL
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={addUrlValue}
                      onChange={(e) => setAddUrlValue(e.target.value)}
                      placeholder="https://my-app.lovable.app"
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    />
                    <button
                      onClick={() => {
                        if (addUrlValue.trim()) {
                          updateProject(id, { externalAppUrl: addUrlValue.trim(), source: 'url' });
                          setShowAddUrl(false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                )}
              </Card>
            )}

            {/* Fallback: productPage exists but no reactCode, no external URL, not description source */}
            {project.source !== 'description' && !project.externalAppUrl && project.productPage && !project.productPage.reactCode && (
              <Card className="p-6 mb-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    App preview unavailable
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                    The live app couldn&apos;t be generated. You can still view your product details and reach out to potential customers.
                  </p>
                  <ProductPagePreview
                    page={project.productPage}
                    onUpdate={handleProductPageUpdate}
                  />
                </div>
              </Card>
            )}

            {!project.productPage && !project.externalAppUrl && project.source !== 'description' && (
              <Card className="p-6 mb-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">&#x1F6E0;&#xFE0F;</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No app generated yet
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    App generation may have failed. Try creating a new project with a different description.
                  </p>
                </div>
              </Card>
            )}

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
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-400">Competitors</span>
                      <button
                        onClick={() => setEditingCompetitors(!editingCompetitors)}
                        className="text-xs text-brand-primary hover:underline"
                      >
                        {editingCompetitors ? "Done" : "Edit"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(project.detectedCompetitors || project.importedAnalysis.competitors).map((c, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                          {c}
                          {editingCompetitors && (
                            <button
                              onClick={() => {
                                const current = project.detectedCompetitors || [...project.importedAnalysis!.competitors];
                                const updated = current.filter((_, idx) => idx !== i);
                                updateProject(id, {
                                  detectedCompetitors: updated,
                                  importedAnalysis: { ...project.importedAnalysis!, competitors: updated },
                                });
                              }}
                              className="text-gray-400 hover:text-red-500 ml-0.5"
                            >
                              x
                            </button>
                          )}
                        </span>
                      ))}
                      {editingCompetitors && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (newCompetitor.trim()) {
                              const current = project.detectedCompetitors || [...project.importedAnalysis!.competitors];
                              const updated = [...current, newCompetitor.trim()];
                              updateProject(id, {
                                detectedCompetitors: updated,
                                importedAnalysis: { ...project.importedAnalysis!, competitors: updated },
                              });
                              setNewCompetitor("");
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="text"
                            value={newCompetitor}
                            onChange={(e) => setNewCompetitor(e.target.value)}
                            placeholder="+ Add"
                            className="w-20 px-2 py-0.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                          />
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Competitors card (when no importedAnalysis but we have detectedCompetitors) */}
            {!project.importedAnalysis && project.detectedCompetitors && project.detectedCompetitors.length > 0 && (
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Competitors</h3>
                  <button
                    onClick={() => setEditingCompetitors(!editingCompetitors)}
                    className="text-xs text-brand-primary hover:underline"
                  >
                    {editingCompetitors ? "Done" : "Edit"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.detectedCompetitors.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                      {c}
                      {editingCompetitors && (
                        <button
                          onClick={() => {
                            const updated = project.detectedCompetitors!.filter((_, idx) => idx !== i);
                            updateProject(id, { detectedCompetitors: updated });
                          }}
                          className="text-gray-400 hover:text-red-500 ml-0.5"
                        >
                          x
                        </button>
                      )}
                    </span>
                  ))}
                  {editingCompetitors && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newCompetitor.trim()) {
                          const updated = [...(project.detectedCompetitors || []), newCompetitor.trim()];
                          updateProject(id, { detectedCompetitors: updated });
                          setNewCompetitor("");
                        }
                      }}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="text"
                        value={newCompetitor}
                        onChange={(e) => setNewCompetitor(e.target.value)}
                        placeholder="+ Add"
                        className="w-20 px-2 py-0.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                      />
                    </form>
                  )}
                </div>
              </Card>
            )}

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
                { key: "investors" as const, label: "Investors", icon: "\u{1F4B0}" },
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
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Who to Reach Out To
                </h2>
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

                <ContactList
                  contacts={activeAudienceGroup === null ? project.contacts : activeContacts}
                  onWriteEmail={handleWriteEmail}
                  emailDrafts={project.emailDrafts}
                />
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
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.detectedCompetitors.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                            {c}
                          </span>
                        ))}
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
