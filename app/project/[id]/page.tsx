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
import type { Contact, EmailDraft, Targeting, ProductPage, PitchPage } from "@/lib/types";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getProject, setContacts, setTargeting, setProductPage, setPitchPages, updateEmailDraft, markDraftStatus, hydrate } = useAppStore();
  const [hydrated, setHydrated] = useState(false);
  const [activeCompany, setActiveCompany] = useState("");
  const [composerContactId, setComposerContactId] = useState<string | null>(null);
  const [activeAudienceGroup, setActiveAudienceGroup] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  const project = getProject(id);

  useEffect(() => {
    if (hydrated && !project) {
      router.push("/");
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
        {/* TOP: Full-width App Preview */}
        {project.productPage?.reactCode && (
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

        {/* Fallback: static product page if no reactCode */}
        {project.productPage && !project.productPage.reactCode && (
          <Card className="p-6 mb-6">
            <ProductPagePreview
              page={project.productPage}
              onUpdate={handleProductPageUpdate}
            />
          </Card>
        )}

        {/* BOTTOM: Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Viability Score (2 cols) */}
          <div className="lg:col-span-2">
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
          </div>

          {/* RIGHT: Contacts with audience group tabs (3 cols) */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Who to Reach Out To
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {project.contacts.length} people across {uniqueCompanies(project.contacts)} companies
              </p>

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
          </div>
        </div>

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
