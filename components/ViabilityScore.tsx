"use client";

import { useState } from "react";
import type { ViabilityAnalysis } from "@/lib/types";

interface ViabilityScoreProps {
  analysis: ViabilityAnalysis;
}

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "Strong":
      return "#22c55e";
    case "Promising":
      return "#eab308";
    case "Needs Work":
      return "#f97316";
    case "Risky":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 55) return "#eab308";
  if (score >= 35) return "#f97316";
  return "#ef4444";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
        />
      </div>
      <span className="text-xs font-mono text-gray-600 w-8 text-right">{score}</span>
    </div>
  );
}

export function ViabilityScore({ analysis }: ViabilityScoreProps) {
  const [expanded, setExpanded] = useState(false);
  const verdictColor = getVerdictColor(analysis.verdict);

  return (
    <div>
      {/* Header: Score + Verdict */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-base">Business Viability</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: verdictColor }}>
            {analysis.overallScore}
          </span>
          <span className="text-xs text-gray-400">/100</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${verdictColor}15`,
              color: verdictColor,
            }}
          >
            {analysis.verdict}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">
        &ldquo;{analysis.summary}&rdquo;
      </p>

      {/* Dimension bars */}
      <div className="space-y-2.5 mb-4">
        <ScoreBar label="Market Demand" score={analysis.dimensions.marketDemand.score} />
        <ScoreBar label="Competition" score={analysis.dimensions.competition.score} />
        <ScoreBar label="Monetization" score={analysis.dimensions.monetization.score} />
        <ScoreBar label="Feasibility" score={analysis.dimensions.feasibility.score} />
        <ScoreBar label="Timing" score={analysis.dimensions.timing.score} />
      </div>

      {/* Competitors */}
      {analysis.dimensions.competition.competitors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Competitors
          </h4>
          <div className="space-y-1.5">
            {analysis.dimensions.competition.competitors.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-gray-300 mt-0.5">&#8226;</span>
                <div>
                  <span className="font-medium text-gray-800">{c.name}</span>
                  {c.funding && (
                    <span className="text-gray-400 text-xs ml-1.5">
                      {c.funding}
                    </span>
                  )}
                  <p className="text-gray-500 text-xs leading-snug">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Top Risks
        </h4>
        <ol className="space-y-1">
          {analysis.topRisks.map((r, i) => (
            <li key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="text-red-400 font-medium shrink-0">{i + 1}.</span>
              {r}
            </li>
          ))}
        </ol>
      </div>

      {/* Opportunities */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Top Opportunities
        </h4>
        <ol className="space-y-1">
          {analysis.topOpportunities.map((o, i) => (
            <li key={i} className="text-sm text-gray-600 flex gap-2">
              <span className="text-green-500 font-medium shrink-0">{i + 1}.</span>
              {o}
            </li>
          ))}
        </ol>
      </div>

      {/* Expand for dimension details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-brand-primary hover:underline font-medium"
      >
        {expanded ? "Hide Full Analysis" : "Expand Full Analysis"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {(
            [
              ["Market Demand", analysis.dimensions.marketDemand],
              ["Competition", analysis.dimensions.competition],
              ["Monetization", analysis.dimensions.monetization],
              ["Feasibility", analysis.dimensions.feasibility],
              ["Timing", analysis.dimensions.timing],
            ] as const
          ).map(([label, dim]) => (
            <div key={label}>
              <h5 className="text-xs font-semibold text-gray-700 mb-0.5">
                {label} ({dim.score}/100)
              </h5>
              <p className="text-xs text-gray-500 leading-relaxed">{dim.reasoning}</p>
            </div>
          ))}

          {"suggestedModels" in analysis.dimensions.monetization && (
            <div>
              <h5 className="text-xs font-semibold text-gray-700 mb-1">
                Suggested Pricing
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {analysis.dimensions.monetization.suggestedModels.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
