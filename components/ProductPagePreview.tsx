"use client";

import { useState, useCallback } from "react";
import { ExternalLink, Copy, Pencil, Check } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { Toast } from "./Toast";
import { COPY } from "@/lib/copy";
import type { ProductPage } from "@/lib/types";

interface ProductPagePreviewProps {
  page: ProductPage;
  onUpdate: (page: ProductPage) => void;
}

export function ProductPagePreview({ page, onUpdate }: ProductPagePreviewProps) {
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
      <h3 className="font-semibold text-gray-900 text-lg mb-4">{COPY.productPageSectionTitle}</h3>
      <Card className="p-6 mb-4">
        {editing ? (
          <div className="space-y-3">
            <input
              value={editPage.name}
              onChange={(e) => setEditPage({ ...editPage, name: e.target.value })}
              className="w-full text-2xl font-bold text-gray-900 border-b border-gray-200 pb-1 focus:outline-none focus:border-brand-primary"
            />
            <input
              value={editPage.tagline}
              onChange={(e) => setEditPage({ ...editPage, tagline: e.target.value })}
              className="w-full text-gray-500 border-b border-gray-200 pb-1 focus:outline-none focus:border-brand-primary"
            />
            {editPage.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-brand-primary">•</span>
                <input
                  value={f}
                  onChange={(e) => {
                    const updated = [...editPage.features];
                    updated[i] = e.target.value;
                    setEditPage({ ...editPage, features: updated });
                  }}
                  className="flex-1 text-sm text-gray-600 border-b border-gray-200 pb-0.5 focus:outline-none focus:border-brand-primary"
                />
              </div>
            ))}
            <Button size="sm" onClick={handleSave}>
              <Check className="w-3.5 h-3.5" />
              Save
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{page.name}</h2>
            <p className="text-gray-500 mb-4">{page.tagline}</p>
            <ul className="space-y-2 mb-4">
              {page.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-brand-primary mt-0.5">•</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium">
              {COPY.productPageCta}
            </div>
          </>
        )}
      </Card>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
          vibesell.app{page.shareUrl}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open(page.shareUrl, "_blank")}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {COPY.productPageOpenPage}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          <Copy className="w-3.5 h-3.5" />
          {COPY.productPageCopyLink}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setEditPage(page); setEditing(!editing); }}>
          <Pencil className="w-3.5 h-3.5" />
          {COPY.productPageEdit}
        </Button>
      </div>

      <Toast message={COPY.toastLinkCopied} visible={showToast} onHide={() => setShowToast(false)} />
    </div>
  );
}
