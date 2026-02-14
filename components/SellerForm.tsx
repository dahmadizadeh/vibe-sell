"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { Button } from "./Button";
import { ExampleChip } from "./ExampleChip";
import { TagInput } from "./TagInput";
import { COPY } from "@/lib/copy";

interface SellerFormProps {
  onSubmit: (description: string, companies: string[], titles?: string[]) => void;
}

export function SellerForm({ onSubmit }: SellerFormProps) {
  const [description, setDescription] = useState("");
  const [companies, setCompanies] = useState<string[]>([""]);
  const [titles, setTitles] = useState<string[]>([]);
  const [showTitles, setShowTitles] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; companies?: string }>({});

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!description.trim()) newErrors.description = COPY.validationRequired;
    const validCompanies = companies.filter((c) => c.trim());
    if (validCompanies.length === 0) newErrors.companies = COPY.validationCompanyRequired;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit(description.trim(), validCompanies, titles.length > 0 ? titles : undefined);
  };

  const updateCompany = (index: number, value: string) => {
    const updated = [...companies];
    updated[index] = value;
    setCompanies(updated);
    if (errors.companies) setErrors((e) => ({ ...e, companies: undefined }));
  };

  const addCompany = () => {
    if (companies.length < 5) setCompanies([...companies, ""]);
  };

  const removeCompany = (index: number) => {
    if (companies.length > 1) setCompanies(companies.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {COPY.sellerFieldLabel}
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder={COPY.sellerFieldPlaceholder}
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl text-base leading-relaxed text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all ${
            errors.description ? "border-red-300" : "border-gray-200"
          }`}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {COPY.sellerExamples.map((example) => (
            <ExampleChip
              key={example}
              label={example}
              onClick={() => {
                setDescription(
                  example.includes("lead scoring")
                    ? "Crustdata's real-time company signals can power lead scoring for their sales team — enriching every lead with headcount growth, funding stage, and hiring velocity"
                    : example.includes("enrichment")
                    ? "Crustdata's data enrichment can fill gaps in their CRM — adding real-time firmographic, technographic, and growth signals to every account"
                    : example.includes("Hiring signal")
                    ? "Crustdata's hiring signal data can help their recruiting team identify companies in active hiring mode — tracking job posting patterns, headcount changes, and team growth"
                    : "Crustdata's company growth tracking can power a real-time dashboard showing headcount trends, funding events, and market expansion signals"
                );
                setErrors((prev) => ({ ...prev, description: undefined }));
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {COPY.sellerCompanyLabel}
        </label>
        {companies.map((company, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={company}
              onChange={(e) => updateCompany(i, e.target.value)}
              placeholder={COPY.sellerCompanyPlaceholder}
              className={`flex-1 px-4 py-2.5 border rounded-xl text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all ${
                errors.companies && i === 0 ? "border-red-300" : "border-gray-200"
              }`}
            />
            {companies.length > 1 && (
              <button
                type="button"
                onClick={() => removeCompany(i)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {errors.companies && <p className="text-sm text-red-500 mt-1">{errors.companies}</p>}
        {companies.length < 5 && (
          <button
            type="button"
            onClick={addCompany}
            className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary/80 transition-colors mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {COPY.sellerAddCompany}
          </button>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowTitles(!showTitles)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {COPY.sellerTitlesLabel}
          {showTitles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showTitles && (
          <div className="mt-2 px-4 py-3 border border-gray-200 rounded-xl">
            <TagInput
              tags={titles}
              onChange={setTitles}
              suggestions={COPY.titleSuggestions}
              placeholder="Add titles..."
            />
            <p className="text-xs text-gray-400 mt-2">{COPY.sellerTitlesHelper}</p>
          </div>
        )}
      </div>

      <Button size="lg" fullWidth onClick={handleSubmit}>
        {COPY.sellerSubmit}
      </Button>
    </div>
  );
}
