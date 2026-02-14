"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./Button";
import { ExampleChip } from "./ExampleChip";
import { COPY } from "@/lib/copy";

interface BuilderFormProps {
  onSubmit: (description: string, notes?: string) => void;
}

export function BuilderForm({ onSubmit }: BuilderFormProps) {
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!description.trim()) {
      setError(COPY.validationRequired);
      return;
    }
    setError("");
    onSubmit(description.trim(), notes.trim() || undefined);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {COPY.builderFieldLabel}
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (error) setError("");
          }}
          placeholder={COPY.builderFieldPlaceholder}
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl text-base leading-relaxed text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all ${
            error ? "border-red-300" : "border-gray-200"
          }`}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {COPY.builderExamples.map((example) => (
            <ExampleChip
              key={example}
              label={example}
              onClick={() => {
                setDescription(
                  example === "Recruiting candidate tracker"
                    ? "A tool that helps recruiting agencies track candidate progress and automate follow-up emails"
                    : example === "Sales prospecting tool"
                    ? "A CRM tool that helps B2B sales teams track leads, manage deal stages, and forecast revenue"
                    : example === "Investor deal flow CRM"
                    ? "A deal flow management tool for VCs and PE firms to track investments, manage due diligence, and report to LPs"
                    : "An AI-powered writing assistant that helps marketing teams create blog posts, social copy, and email campaigns 10x faster"
                );
                setError("");
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {COPY.builderNotesLabel}
          {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={COPY.builderNotesPlaceholder}
            rows={2}
            className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl text-base leading-relaxed text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
          />
        )}
      </div>

      <Button size="lg" fullWidth onClick={handleSubmit}>
        {COPY.builderSubmit}
      </Button>
    </div>
  );
}
