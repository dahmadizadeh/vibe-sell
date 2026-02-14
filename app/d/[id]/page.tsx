"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MockupCard } from "@/components/MockupCard";
import { COPY } from "@/lib/copy";
import { loadAllProjects } from "@/lib/project-store";
import type { Project, PitchPage } from "@/lib/types";

function PitchPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const shareId = params.id as string;
  const companyParam = searchParams.get("company");
  const [project, setProject] = useState<Project | null>(null);
  const [page, setPage] = useState<PitchPage | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const projects = loadAllProjects();
    const found = projects.find(
      (p) => p.pitchPages?.some((pp) => pp.shareUrl === `/d/${shareId}`)
    );
    setProject(found || null);

    if (found?.pitchPages) {
      if (companyParam) {
        const match = found.pitchPages.find(
          (pp) => pp.targetCompany.toLowerCase().replace(/[^a-z]/g, "") === companyParam.toLowerCase()
        );
        setPage(match || found.pitchPages[0]);
      } else {
        const match = found.pitchPages.find((pp) => pp.shareUrl === `/d/${shareId}`);
        setPage(match || found.pitchPages[0]);
      }
    }
    setLoaded(true);
  }, [shareId, companyParam]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{COPY.shareableNotFound}</h1>
          <p className="text-gray-500">{COPY.shareableNotFoundDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-12 text-center">
        <div className="text-4xl font-bold text-gray-900 mb-4">{page.targetCompany}</div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">{page.headline}</h1>
        <p className="text-lg text-gray-500 leading-relaxed">{page.subtitle}</p>
      </div>

      {/* Problem */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">The Problem</h2>
        <ul className="space-y-3">
          {page.problemPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-base text-gray-600 leading-relaxed">
              <span className="text-red-400 mt-0.5 shrink-0 text-lg">•</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Solution Mockups */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">The Solution</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {page.solutionMockups.map((mockup, i) => (
            <MockupCard key={i} mockup={mockup} />
          ))}
        </div>
      </div>

      {/* Why Now */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Why Now</h2>
        <div className="space-y-3">
          {page.urgencySignals.map((signal, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-amber-500 mt-0.5 shrink-0 text-lg">→</span>
              <p className="text-base font-medium text-gray-700">{signal}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-md mx-auto px-4 pb-16 text-center">
        <div className="bg-gray-50 rounded-xl p-8">
          <p className="text-gray-700 font-medium text-lg mb-4">{page.ctaText}</p>
          <button className="px-8 py-3 bg-brand-primary text-white rounded-xl text-lg font-medium hover:bg-brand-primary/90 transition-colors">
            Schedule a Call
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-sm text-gray-400">{COPY.pitchPageFooter}</p>
      </footer>
    </div>
  );
}

export default function PublicPitchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PitchPageContent />
    </Suspense>
  );
}
