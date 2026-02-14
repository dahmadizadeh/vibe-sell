"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { ContactList } from "@/components/ContactList";
import { TargetingEditor } from "@/components/TargetingEditor";
import { ProductPagePreview } from "@/components/ProductPagePreview";
import { AppPreview } from "@/components/AppPreview";
import { PitchPagePreview } from "@/components/PitchPagePreview";
import { CompanyTabs } from "@/components/CompanyTabs";
import { EmailComposer } from "@/components/EmailComposer";
import { useAppStore } from "@/lib/store";
import { COPY } from "@/lib/copy";
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

  const handleWriteEmail = useCallback((contact: Contact) => {
    setComposerContactId(contact.id);

    // Lazy enrichment: if no email but has LinkedIn, enrich in background
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
  const activeContacts = isBuilder
    ? project.contacts
    : project.contacts.filter((c) => c.company === activeCompany || project.contacts.every((ct) => ct.company !== activeCompany));

  const composerContact = composerContactId
    ? activeContacts.find((c) => c.id === composerContactId) || null
    : null;
  const composerDraft = composerContactId
    ? project.emailDrafts.find((d) => d.contactId === composerContactId) || null
    : null;

  return (
    <div className="max-w-results mx-auto px-4 py-8">
      {/* Seller mode: company tabs */}
      {!isBuilder && sellerCompanies.length > 1 && (
        <CompanyTabs
          companies={sellerCompanies}
          active={activeCompany}
          onChange={setActiveCompany}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT CARD */}
        {isBuilder ? (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {COPY.resultsBuilderHeader(project.contacts.length, uniqueCompanies(project.contacts))}
            </h2>
            <TargetingEditor
              targeting={project.targeting}
              onChange={handleTargetingChange}
              onUpdate={handleTargetingUpdate}
            />
            <ContactList
              contacts={project.contacts}
              onWriteEmail={handleWriteEmail}
              emailDrafts={project.emailDrafts}
            />
          </Card>
        ) : (
          <Card className="p-6">
            {activePitchPage && (
              <PitchPagePreview
                page={activePitchPage}
                onUpdate={handlePitchPageUpdate}
              />
            )}
          </Card>
        )}

        {/* RIGHT CARD */}
        {isBuilder ? (
          <Card className="p-6">
            {project.productPage?.reactCode && (
              <div style={{ background: '#f0f0f0', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
                <strong>Debug:</strong> reactCode length: {project.productPage.reactCode.length} chars
                <details>
                  <summary>Show raw code</summary>
                  <pre style={{ maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', fontSize: 11 }}>
                    {project.productPage.reactCode.slice(0, 2000)}
                  </pre>
                </details>
              </div>
            )}
            {project.productPage?.reactCode ? (
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {project.productPage.name}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {project.productPage.tagline}
                </p>
                <AppPreview code={project.productPage.reactCode} height="500px" />
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => window.open(project.productPage!.shareUrl, "_blank")}
                    className="px-3 py-1.5 text-sm font-medium text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-primary/5 transition-colors"
                  >
                    Open Page
                  </button>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}${project.productPage!.shareUrl}`;
                      navigator.clipboard.writeText(url);
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ) : (
              project.productPage && (
                <ProductPagePreview
                  page={project.productPage}
                  onUpdate={handleProductPageUpdate}
                />
              )
            )}
          </Card>
        ) : (
          <Card className="p-6">
            <ContactList
              contacts={activeContacts}
              onWriteEmail={handleWriteEmail}
              groupByRole
              companyName={activeCompany}
              emailDrafts={project.emailDrafts}
            />
          </Card>
        )}
      </div>

      {/* Email Composer */}
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
