"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { ModeSelector } from "@/components/ModeSelector";
import { BuilderForm } from "@/components/BuilderForm";
import { SellerForm } from "@/components/SellerForm";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAppStore } from "@/lib/store";
import { COPY } from "@/lib/copy";
import type { ProjectMode } from "@/lib/types";

export default function HomePage() {
  const [mode, setMode] = useState<ProjectMode>("seller");
  const router = useRouter();
  const { projects, createProject, hydrate, userProfile, setUserProfile } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  // User setup modal
  const [showSetup, setShowSetup] = useState(false);
  const [setupName, setSetupName] = useState("");
  const [setupCompany, setSetupCompany] = useState("");
  const [setupEmail, setSetupEmail] = useState("");

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !userProfile) {
      setShowSetup(true);
    }
  }, [hydrated, userProfile]);

  const handleSetupSubmit = () => {
    if (!setupName.trim()) return;
    setUserProfile({
      name: setupName.trim(),
      company: setupCompany.trim(),
      email: setupEmail.trim(),
    });
    setShowSetup(false);
  };

  const handleBuilderSubmit = (description: string, notes?: string) => {
    const fullDescription = notes ? `${description}\n\nAdditional context: ${notes}` : description;
    const title = description.slice(0, 60);
    const id = createProject({ mode: "builder", title, description: fullDescription });
    router.push(`/loading?projectId=${id}`);
  };

  const handleSellerSubmit = (description: string, companies: string[], titles?: string[]) => {
    const title = `${description.slice(0, 40)} for ${companies[0]}`;
    const fullDescription = titles
      ? `${description}\n\nTarget titles: ${titles.join(", ")}`
      : description;
    const id = createProject({
      mode: "seller",
      title,
      description: fullDescription,
      targetCompanies: companies,
    });
    router.push(`/loading?projectId=${id}`);
  };

  // Get recent seller projects for quick start
  const sellerProjects = hydrated
    ? projects
        .filter((p) => p.mode === "seller" && p.pitchPages && p.pitchPages.length > 0)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
    : [];

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-form">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Build it. Sell it. Today.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Describe what you&apos;re working on and get real customers — or create a pitch page for any company.
          </p>
        </div>

        {/* Quick Start: Your Accounts */}
        {sellerProjects.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                {COPY.quickStartHeader}
              </h2>
              <button
                onClick={() => router.push("/projects")}
                className="text-xs text-brand-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sellerProjects.map((project) => (
                <Card
                  key={project.id}
                  className="p-3 cursor-pointer hover:border-brand-primary/30 transition-colors"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {project.targetCompanies?.[0] || project.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {project.stats.contactsFound} contacts
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        <ModeSelector selected={mode} onChange={setMode} />

        <div className="mt-8 animate-fade-in" key={mode}>
          {mode === "builder" ? (
            <BuilderForm onSubmit={handleBuilderSubmit} />
          ) : (
            <SellerForm onSubmit={handleSellerSubmit} />
          )}
        </div>
      </div>

      {/* User Setup Modal */}
      {showSetup && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 animate-fade-in" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-slide-up">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {COPY.userSetupTitle}
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                {COPY.userSetupSubtitle}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {COPY.userSetupNameLabel}
                  </label>
                  <input
                    type="text"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    placeholder={COPY.userSetupNamePlaceholder}
                    autoFocus
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {COPY.userSetupCompanyLabel}
                  </label>
                  <input
                    type="text"
                    value={setupCompany}
                    onChange={(e) => setSetupCompany(e.target.value)}
                    placeholder={COPY.userSetupCompanyPlaceholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {COPY.userSetupEmailLabel}
                  </label>
                  <input
                    type="email"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    placeholder={COPY.userSetupEmailPlaceholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSetupSubmit(); }}
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button fullWidth onClick={handleSetupSubmit} disabled={!setupName.trim()}>
                  {COPY.userSetupSubmit}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" onClick={() => setShowSetup(false)}>
                  Skip
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
