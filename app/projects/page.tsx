"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Building2 } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/Button";
import { useAppStore } from "@/lib/store";
import { COPY } from "@/lib/copy";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, hydrate, cloneProject } = useAppStore();
  const [hydrated, setHydrated] = useState(false);
  const [reuseModalId, setReuseModalId] = useState<string | null>(null);
  const [reuseCompany, setReuseCompany] = useState("");

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  const handleOpen = (id: string) => {
    router.push(`/project/${id}`);
  };

  const handleFindMore = (id: string) => {
    router.push(`/loading?projectId=${id}`);
  };

  const handleReuse = (id: string) => {
    setReuseModalId(id);
    setReuseCompany("");
  };

  const handleReuseSubmit = () => {
    if (!reuseModalId || !reuseCompany.trim()) return;
    const newId = cloneProject(reuseModalId, reuseCompany.trim());
    setReuseModalId(null);
    if (newId) router.push(`/loading?projectId=${newId}`);
  };

  if (!hydrated) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sorted = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const builderProjects = sorted.filter((p) => p.mode === "builder");
  const sellerProjects = sorted.filter((p) => p.mode === "seller");

  // Group seller projects by company
  const sellerByCompany: Record<string, typeof sellerProjects> = {};
  for (const project of sellerProjects) {
    const company = project.targetCompanies?.[0] || "Other";
    if (!sellerByCompany[company]) sellerByCompany[company] = [];
    sellerByCompany[company].push(project);
  }

  return (
    <div className="max-w-results mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{COPY.workspaceTitle}</h1>

      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">{COPY.workspaceEmpty}</p>
          <Button onClick={() => router.push("/")}>
            {COPY.workspaceGetStarted}
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Seller Projects — Grouped by Company */}
          {Object.keys(sellerByCompany).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {COPY.workspaceAccountsHeader}
              </h2>
              <div className="space-y-6">
                {Object.entries(sellerByCompany).map(([company, companyProjects]) => (
                  <div key={company}>
                    <h3 className="text-base font-medium text-gray-900 mb-3">{company}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {companyProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onOpen={handleOpen}
                          onReuse={handleReuse}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Builder Projects */}
          {builderProjects.length > 0 && (
            <div>
              {sellerProjects.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Builder Projects
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {builderProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={handleOpen}
                    onFindMore={handleFindMore}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reuse modal */}
      {reuseModalId && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
            onClick={() => setReuseModalId(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-slide-up">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">
                {COPY.workspaceReusePrompt}
              </h3>
              <input
                type="text"
                value={reuseCompany}
                onChange={(e) => setReuseCompany(e.target.value)}
                placeholder="e.g. Notion"
                autoFocus
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary mb-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleReuseSubmit();
                }}
              />
              <div className="flex gap-2">
                <Button fullWidth onClick={handleReuseSubmit} disabled={!reuseCompany.trim()}>
                  Create
                </Button>
                <Button variant="secondary" fullWidth onClick={() => setReuseModalId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
