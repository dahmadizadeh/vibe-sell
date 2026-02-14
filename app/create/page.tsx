"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { ModeSelector } from "@/components/ModeSelector";
import { BuilderForm } from "@/components/BuilderForm";
import { SellerForm } from "@/components/SellerForm";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAppStore } from "@/lib/store";
import { COPY } from "@/lib/copy";
import type { ProjectMode, ProjectGoal } from "@/lib/types";

function CreateContent() {
  const searchParams = useSearchParams();
  const initialIdea = searchParams.get("idea");
  const initialMode = searchParams.get("mode") as ProjectMode | null;
  const initialSource = searchParams.get("source");
  const initialUrl = searchParams.get("url");

  const [mode, setMode] = useState<ProjectMode>(initialMode || "seller");
  const router = useRouter();
  const { projects, createProject, hydrate, userProfile, setUserProfile } = useAppStore();
  const [hydrated, setHydrated] = useState(false);
  const autoStartedRef = useRef(false);

  // Goal selection state
  const [showGoalStep, setShowGoalStep] = useState(false);
  const [projectGoal, setProjectGoal] = useState<ProjectGoal | null>(null);
  const [pendingSubmit, setPendingSubmit] = useState<(() => void) | null>(null);

  // Import sub-mode state
  const [builderSubMode, setBuilderSubMode] = useState<'idea' | 'import'>('idea');
  const [importUrl, setImportUrl] = useState("");
  const [importDescription, setImportDescription] = useState("");
  const [importError, setImportError] = useState("");

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
      // Don't show setup if auto-starting from landing page
      if (!initialIdea && !(initialSource === 'url' && initialUrl)) {
        setShowSetup(true);
      }
    }
  }, [hydrated, userProfile, initialIdea, initialSource, initialUrl]);

  const handleGoalSelect = (goal: ProjectGoal) => {
    setProjectGoal(goal);
    setShowGoalStep(false);
    if (pendingSubmit) {
      // Execute the pending submit with the selected goal
      pendingSubmit();
      setPendingSubmit(null);
    }
  };

  const handleBuilderSubmit = (description: string, notes?: string) => {
    const fullDescription = notes ? `${description}\n\nAdditional context: ${notes}` : description;
    const title = description.slice(0, 60);

    const doSubmit = () => {
      const id = createProject({ mode: "builder", title, description: fullDescription, projectGoal: projectGoal || undefined });
      router.push(`/loading?projectId=${id}`);
    };

    if (!projectGoal) {
      setPendingSubmit(() => doSubmit);
      setShowGoalStep(true);
      return;
    }
    doSubmit();
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

  const handleImportSubmit = () => {
    const url = importUrl.trim();
    const desc = importDescription.trim();
    if (!url && !desc) {
      setImportError(COPY.importValidation);
      return;
    }
    setImportError("");
    const source: 'url' | 'description' = url ? 'url' : 'description';
    const title = desc ? desc.slice(0, 60) : url;

    const doSubmit = () => {
      const id = createProject({
        mode: "builder",
        title,
        description: desc || url,
        source,
        externalAppUrl: url || undefined,
        projectGoal: projectGoal || undefined,
      });
      router.push(`/loading?projectId=${id}`);
    };

    if (!projectGoal) {
      setPendingSubmit(() => doSubmit);
      setShowGoalStep(true);
      return;
    }
    doSubmit();
  };

  // Auto-start builder flow if ?idea= is present from landing page
  useEffect(() => {
    if (hydrated && initialIdea && !autoStartedRef.current) {
      autoStartedRef.current = true;
      // Show goal step before starting
      setPendingSubmit(() => () => {
        const id = createProject({ mode: "builder", title: initialIdea.slice(0, 60), description: initialIdea, projectGoal: projectGoal || undefined });
        router.push(`/loading?projectId=${id}`);
      });
      setShowGoalStep(true);
    }
  }, [hydrated, initialIdea]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-start URL import flow if ?source=url&url=... is present from landing page
  useEffect(() => {
    if (hydrated && initialSource === 'url' && initialUrl && !autoStartedRef.current) {
      autoStartedRef.current = true;
      setPendingSubmit(() => () => {
        const id = createProject({
          mode: "builder",
          title: initialUrl,
          description: initialUrl,
          source: 'url',
          externalAppUrl: initialUrl,
          projectGoal: projectGoal || undefined,
        });
        router.push(`/loading?projectId=${id}`);
      });
      setShowGoalStep(true);
    }
  }, [hydrated, initialSource, initialUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetupSubmit = () => {
    if (!setupName.trim()) return;
    setUserProfile({
      name: setupName.trim(),
      company: setupCompany.trim(),
      email: setupEmail.trim(),
    });
    setShowSetup(false);
  };

  // Get recent seller projects for quick start
  const sellerProjects = hydrated
    ? projects
        .filter((p) => p.mode === "seller" && p.pitchPages && p.pitchPages.length > 0)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
    : [];

  // If auto-starting and goal already selected, show a loading spinner
  if ((initialIdea || (initialSource === 'url' && initialUrl)) && !showGoalStep) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Starting your build...</p>
        </div>
      </div>
    );
  }

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
            <>
              {/* Segmented toggle: idea vs import */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBuilderSubMode('idea')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      builderSubMode === 'idea'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {COPY.builderToggleIdea}
                  </button>
                  <button
                    onClick={() => setBuilderSubMode('import')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      builderSubMode === 'import'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {COPY.builderToggleBuilt}
                  </button>
                </div>
              </div>

              {builderSubMode === 'idea' ? (
                <BuilderForm onSubmit={handleBuilderSubmit} />
              ) : (
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {COPY.importUrlLabel}
                      </label>
                      <input
                        type="url"
                        value={importUrl}
                        onChange={(e) => { setImportUrl(e.target.value); setImportError(""); }}
                        placeholder={COPY.importUrlPlaceholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Works with Lovable, Replit, Vercel, or any URL
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {COPY.importDescLabel}
                      </label>
                      <textarea
                        value={importDescription}
                        onChange={(e) => { setImportDescription(e.target.value); setImportError(""); }}
                        placeholder={COPY.importDescPlaceholder}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none"
                      />
                    </div>
                    {importError && (
                      <p className="text-sm text-red-500">{importError}</p>
                    )}
                    <Button fullWidth onClick={handleImportSubmit}>
                      {COPY.importSubmit}
                    </Button>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <SellerForm onSubmit={handleSellerSubmit} />
          )}
        </div>
      </div>

      {/* Goal Selection Modal */}
      {showGoalStep && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 animate-fade-in" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg animate-slide-up">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                What&apos;s your goal?
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                This shapes your analysis, outreach, and growth playbooks.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { key: 'side_project' as ProjectGoal, label: 'Side Project', desc: 'Validate an idea, find early adopters', icon: '\u{1F9EA}' },
                  { key: 'small_business' as ProjectGoal, label: 'Small Business', desc: 'Build a profitable, sustainable business', icon: '\u{1F3EA}' },
                  { key: 'venture_scale' as ProjectGoal, label: 'Venture Scale', desc: 'Raise funding, grow fast, go big', icon: '\u{1F680}' },
                ]).map((goal) => (
                  <button
                    key={goal.key}
                    onClick={() => handleGoalSelect(goal.key)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-left"
                  >
                    <span className="text-2xl block mb-2">{goal.icon}</span>
                    <span className="font-semibold text-gray-900 text-sm block">{goal.label}</span>
                    <span className="text-xs text-gray-500 mt-1 block">{goal.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

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

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreateContent />
    </Suspense>
  );
}
