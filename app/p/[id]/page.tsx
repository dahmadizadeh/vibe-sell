"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppPreview } from "@/components/AppPreview";
import { COPY } from "@/lib/copy";
import { loadAllProjects } from "@/lib/project-store";
import type { Project } from "@/lib/types";

export default function PublicProductPage() {
  const params = useParams();
  const shareId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const projects = loadAllProjects();
    const found = projects.find((p) => p.productPage?.shareUrl === `/p/${shareId}`);
    setProject(found || null);
    setLoaded(true);
  }, [shareId]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project?.productPage) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{COPY.shareableNotFound}</h1>
          <p className="text-gray-500">{COPY.shareableNotFoundDesc}</p>
        </div>
      </div>
    );
  }

  const page = project.productPage;

  // If we have generated React code, render the live app full-screen
  if (page.reactCode) {
    return (
      <div className="min-h-screen bg-white">
        {/* Minimal header */}
        <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div>
            <span className="font-semibold text-gray-900">{page.name}</span>
            <span className="text-gray-400 text-sm ml-2">{page.tagline}</span>
          </div>
          <span className="text-xs text-gray-400">{COPY.shareableFooter}</span>
        </div>
        {/* Full-screen app preview */}
        <AppPreview code={page.reactCode} height="calc(100vh - 53px)" />
      </div>
    );
  }

  // Fallback: static product page for projects without generated code
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">{page.name}</h1>
        <p className="text-xl text-gray-500 leading-relaxed">{page.tagline}</p>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {page.features.map((feature, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-primary font-bold">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-md mx-auto px-4 pb-16 text-center">
        <button className="px-8 py-3 bg-brand-primary text-white rounded-xl text-lg font-medium hover:bg-brand-primary/90 transition-colors">
          {COPY.productPageCta}
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-sm text-gray-400">{COPY.shareableFooter}</p>
      </footer>
    </div>
  );
}
