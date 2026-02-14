"use client";

import { Target, FileText, Check } from "lucide-react";
import { Card } from "./Card";
import { COPY } from "@/lib/copy";
import type { ProjectMode } from "@/lib/types";

interface ModeSelectorProps {
  selected: ProjectMode;
  onChange: (mode: ProjectMode) => void;
}

export function ModeSelector({ selected, onChange }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card
        selected={selected === "builder"}
        onClick={() => onChange("builder")}
        className="relative p-6"
      >
        {selected === "builder" && (
          <div className="absolute top-3 right-3 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
        <Target className="w-8 h-8 text-brand-primary mb-3" />
        <h3 className="font-semibold text-gray-900 text-base mb-1">
          {COPY.modeBuilderTitle}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {COPY.modeBuilderSubtitle}
        </p>
      </Card>

      <Card
        selected={selected === "seller"}
        onClick={() => onChange("seller")}
        className="relative p-6"
      >
        {selected === "seller" && (
          <div className="absolute top-3 right-3 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}
        <FileText className="w-8 h-8 text-brand-primary mb-3" />
        <h3 className="font-semibold text-gray-900 text-base mb-1">
          {COPY.modeSellerTitle}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {COPY.modeSellerSubtitle}
        </p>
      </Card>
    </div>
  );
}
