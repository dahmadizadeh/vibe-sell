"use client";

import { useState, useCallback } from "react";
import { ExternalLink, Copy, Pencil, Check } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Toast } from "./Toast";
import { MockupCard } from "./MockupCard";
import { COPY } from "@/lib/copy";
import type { PitchPage } from "@/lib/types";

interface PitchPagePreviewProps {
  page: PitchPage;
  onUpdate: (page: PitchPage) => void;
}

export function PitchPagePreview({ page, onUpdate }: PitchPagePreviewProps) {
  const [editing, setEditing] = useState(false);
  const [editPage, setEditPage] = useState(page);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = useCallback(() => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}${page.shareUrl}`;
    navigator.clipboard.writeText(url);
    setShowToast(true);
  }, [page.shareUrl]);

  const handleSave = () => {
    onUpdate(editPage);
    setEditing(false);
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 text-lg mb-4">{COPY.pitchPageSectionTitle}</h3>
      <Card className="p-0 mb-4 max-h-[600px] overflow-y-auto">
        {editing ? (
          <div className="p-6 space-y-4">
            <input
              value={editPage.headline}
              onChange={(e) => setEditPage({ ...editPage, headline: e.target.value })}
              className="w-full text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 focus:outline-none focus:border-brand-primary"
            />
            <input
              value={editPage.subtitle}
              onChange={(e) => setEditPage({ ...editPage, subtitle: e.target.value })}
              className="w-full text-gray-500 border-b border-gray-200 pb-1 focus:outline-none focus:border-brand-primary"
            />
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">The Problem</label>
              {editPage.problemPoints.map((p, i) => (
                <input
                  key={i}
                  value={p}
                  onChange={(e) => {
                    const updated = [...editPage.problemPoints];
                    updated[i] = e.target.value;
                    setEditPage({ ...editPage, problemPoints: updated });
                  }}
                  className="w-full mt-2 text-sm text-gray-600 border-b border-gray-200 pb-0.5 focus:outline-none focus:border-brand-primary"
                />
              ))}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Why Now</label>
              {editPage.urgencySignals.map((s, i) => (
                <input
                  key={i}
                  value={s}
                  onChange={(e) => {
                    const updated = [...editPage.urgencySignals];
                    updated[i] = e.target.value;
                    setEditPage({ ...editPage, urgencySignals: updated });
                  }}
                  className="w-full mt-2 text-sm text-gray-600 border-b border-gray-200 pb-0.5 focus:outline-none focus:border-brand-primary"
                />
              ))}
            </div>
            <Button size="sm" onClick={handleSave}>
              <Check className="w-3.5 h-3.5" />
              Save
            </Button>
          </div>
        ) : (
          <div>
            {/* Hero — gradient header */}
            <div className="bg-gradient-to-br from-brand-primary to-blue-700 text-white px-6 py-8 rounded-t-xl">
              <div className="text-center">
                <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wide">Built for {page.targetCompany}</p>
                <h2 className="text-xl font-bold mb-2">{page.headline}</h2>
                <p className="text-blue-100 text-sm leading-relaxed">{page.subtitle}</p>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Problem */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  The Problem
                </h3>
                <div className="space-y-2">
                  {page.problemPoints.map((point, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 text-sm text-gray-600 leading-relaxed p-3 rounded-lg ${
                        i % 2 === 0 ? "bg-gray-50" : ""
                      }`}
                    >
                      <span className="text-red-400 mt-0.5 shrink-0 font-medium">{i + 1}.</span>
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution Mockups */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                  The Solution
                </h3>
                <div className="space-y-4">
                  {page.solutionMockups.map((mockup, i) => (
                    <MockupCard key={i} mockup={mockup} />
                  ))}
                </div>
              </div>

              {/* Why Now */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Why Now
                </h3>
                <div className="space-y-2">
                  {page.urgencySignals.map((signal, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-amber-500 mt-0.5 shrink-0 text-sm font-bold">!</span>
                      <p className="text-sm font-medium text-gray-700">{signal}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-700 font-semibold mb-3">{page.ctaText}</p>
                <div className="inline-flex items-center px-6 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-medium shadow-sm">
                  Schedule a Call
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 pb-1">
                <p className="text-xs text-gray-400">{COPY.pitchPageFooter}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
          vibesell.app{page.shareUrl}
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => window.open(page.shareUrl, "_blank")}>
          <ExternalLink className="w-3.5 h-3.5" />
          {COPY.pitchPageOpenFull}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          <Copy className="w-3.5 h-3.5" />
          {COPY.pitchPageCopyLink}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setEditPage(page); setEditing(!editing); }}>
          <Pencil className="w-3.5 h-3.5" />
          {COPY.pitchPageEdit}
        </Button>
      </div>

      <Toast message={COPY.toastLinkCopied} visible={showToast} onHide={() => setShowToast(false)} />
    </div>
  );
}
