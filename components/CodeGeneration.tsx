"use client";

import { useEffect, useRef, useMemo } from "react";
import { Loader2, Check } from "lucide-react";
import { AppPreview } from "./AppPreview";

interface StepDef {
  key: string;
  label: string;
}

interface CodeGenerationProps {
  streamedCode: string;
  status: string;
  statusMessage: string;
  appName?: string;
  appTagline?: string;
  reactCode?: string;
  steps?: StepDef[];
}

const DEFAULT_STEPS: StepDef[] = [
  { key: "generating", label: "Build App" },
  { key: "analyzing", label: "Analyze" },
  { key: "finding_customers", label: "Find People" },
  { key: "complete", label: "Done" },
];

function extractCodeFromStream(raw: string): string | null {
  const marker = '"reactCode"';
  const idx = raw.indexOf(marker);
  if (idx === -1) return null;

  const afterMarker = raw.substring(idx + marker.length);
  const colonIdx = afterMarker.indexOf('"');
  if (colonIdx === -1) return null;

  const valueStart = idx + marker.length + colonIdx + 1;
  let code = "";
  let i = valueStart;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '"' && raw[i - 1] !== "\\") break;
    if (ch === "\\" && i + 1 < raw.length) {
      const next = raw[i + 1];
      if (next === "n") { code += "\n"; i += 2; continue; }
      if (next === "t") { code += "\t"; i += 2; continue; }
      if (next === '"') { code += '"'; i += 2; continue; }
      if (next === "\\") { code += "\\"; i += 2; continue; }
    }
    code += ch;
    i++;
  }

  return code.length > 10 ? code : null;
}

export function CodeGeneration({
  streamedCode,
  status,
  statusMessage,
  appName,
  appTagline,
  reactCode,
  steps: stepsProp,
}: CodeGenerationProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const steps = stepsProp || DEFAULT_STEPS;

  const displayCode = useMemo(() => {
    if (reactCode) return reactCode;
    const extracted = extractCodeFromStream(streamedCode);
    if (extracted) return extracted;
    if (streamedCode.length > 0) return streamedCode;
    return "// Analyzing your idea...\n";
  }, [reactCode, streamedCode]);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight;
    }
  }, [displayCode]);

  const showPreview =
    status === "app_ready" ||
    status === "analyzing" ||
    status === "targeting" ||
    status === "finding_customers" ||
    status === "complete";
  const isStreaming = status === "generating" && !reactCode;
  const charCount = streamedCode.length;

  // Determine which steps are done/active
  const stepKeys = steps.map((s) => s.key);
  const currentIdx = stepKeys.indexOf(status);
  // "app_ready" is a sub-state of "generating", treat it as generating done
  const effectiveIdx =
    status === "app_ready"
      ? stepKeys.indexOf("analyzing") >= 0
        ? stepKeys.indexOf("analyzing")
        : stepKeys.indexOf("generating") + 1
      : currentIdx;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Status bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          {status === "complete" ? (
            <div className="w-6 h-6 rounded-full bg-brand-success flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
          ) : (
            <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
          )}
          <span className="text-sm font-medium text-gray-700">{statusMessage}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {isStreaming && charCount > 0 && (
            <span className="text-xs text-gray-400 font-mono">
              {Math.round(charCount / 10) * 10} chars
            </span>
          )}
          {appName && (
            <span className="text-sm text-gray-400">
              {appName}{appTagline ? ` \u2014 ${appTagline}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-4 text-xs flex-wrap">
        {steps.map((step, i) => {
          const isDone = effectiveIdx > i || status === "complete";
          const isActive = effectiveIdx === i && status !== "complete";

          return (
            <div key={step.key} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={`w-6 h-px ${isDone ? "bg-brand-success" : "bg-gray-200"}`}
                />
              )}
              <div
                className={`flex items-center gap-1.5 ${
                  isDone
                    ? "text-brand-success"
                    : isActive
                    ? "text-brand-primary"
                    : "text-gray-300"
                }`}
              >
                {isDone ? (
                  <div className="w-4 h-4 rounded-full bg-brand-success flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-200" />
                )}
                <span className="font-medium">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content: code panel + optional preview */}
      <div className={`grid gap-4 ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Code panel */}
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-[#1e1e2e] flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#181825] border-b border-[#313244]">
            <div className="w-3 h-3 rounded-full bg-[#f38ba8]" />
            <div className="w-3 h-3 rounded-full bg-[#f9e2af]" />
            <div className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
            <span className="text-xs text-[#6c7086] ml-2 font-mono">App.jsx</span>
          </div>
          <pre
            ref={codeRef}
            className="p-4 text-[13px] leading-relaxed font-mono text-[#cdd6f4] overflow-auto flex-1 whitespace-pre-wrap"
            style={{ maxHeight: showPreview ? "400px" : "500px", minHeight: "300px" }}
          >
            <code>{displayCode}</code>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-[#cdd6f4] animate-pulse ml-0.5" />
            )}
          </pre>
        </div>

        {/* Live preview */}
        {showPreview && reactCode && (
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-white flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="w-2 h-2 rounded-full bg-brand-success" />
              <span className="text-xs text-gray-500 font-medium">Live Preview</span>
            </div>
            <div className="flex-1" style={{ minHeight: "300px" }}>
              <AppPreview code={reactCode} height="400px" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
