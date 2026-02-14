"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TagInput } from "./TagInput";
import { Button } from "./Button";
import { COPY } from "@/lib/copy";
import type { Targeting } from "@/lib/types";

interface TargetingEditorProps {
  targeting: Targeting;
  onChange: (targeting: Targeting) => void;
  onUpdate: () => void;
}

export function TargetingEditor({ targeting, onChange, onUpdate }: TargetingEditorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-blue-50 rounded-xl p-4 mb-6">
      <p className="text-sm text-gray-700 leading-relaxed">{targeting.summary}</p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-brand-primary font-medium mt-2 hover:text-brand-primary/80 transition-colors"
      >
        {COPY.resultsEditTargeting}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="mt-4 space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Industries
            </label>
            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
              <TagInput tags={targeting.industries} onChange={(industries) => onChange({ ...targeting, industries })} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Company Size
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={targeting.companySize.min}
                onChange={(e) =>
                  onChange({
                    ...targeting,
                    companySize: { ...targeting.companySize, min: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                placeholder="Min"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="number"
                value={targeting.companySize.max}
                onChange={(e) =>
                  onChange({
                    ...targeting,
                    companySize: { ...targeting.companySize, max: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                placeholder="Max"
              />
              <span className="text-gray-400 text-sm">employees</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Titles
            </label>
            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
              <TagInput tags={targeting.titles} onChange={(titles) => onChange({ ...targeting, titles })} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Regions
            </label>
            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
              <TagInput tags={targeting.regions} onChange={(regions) => onChange({ ...targeting, regions })} />
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={onUpdate}>
            {COPY.resultsUpdateTargeting}
          </Button>
        </div>
      )}
    </div>
  );
}
