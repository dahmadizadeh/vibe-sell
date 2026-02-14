"use client";

import type { PMFScore } from "@/lib/types";

interface PMFDashboardProps {
  pmfScore: PMFScore;
  conversationCount: number;
  onReEvaluate?: () => void;
  isReEvaluating?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#eab308";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-32 shrink-0">{label}</span>
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

export function PMFDashboard({
  pmfScore,
  conversationCount,
  onReEvaluate,
  isReEvaluating,
}: PMFDashboardProps) {
  const overallColor = getScoreColor(pmfScore.overall);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">Product-Market Fit Score</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Based on {conversationCount} conversation{conversationCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-3xl font-bold" style={{ color: overallColor }}>
              {pmfScore.overall}
            </span>
            <span className="text-sm text-gray-400">/100</span>
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pmfScore.overall}%`, backgroundColor: overallColor }}
        />
      </div>

      {/* Dimension bars */}
      <div className="space-y-2.5 mb-5">
        <ScoreBar label="Problem Validation" score={pmfScore.dimensions.problemValidation} />
        <ScoreBar label="Solution Interest" score={pmfScore.dimensions.solutionInterest} />
        <ScoreBar label="Willingness to Pay" score={pmfScore.dimensions.willingnessToPay} />
        <ScoreBar label="Referral Potential" score={pmfScore.dimensions.referralPotential} />
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">
        &ldquo;{pmfScore.summary}&rdquo;
      </p>

      {/* Risk + Action */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">
            Biggest Risk
          </p>
          <p className="text-sm text-red-700 leading-relaxed">{pmfScore.biggestRisk}</p>
        </div>
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
            Suggested Action
          </p>
          <p className="text-sm text-blue-700 leading-relaxed">{pmfScore.suggestedAction}</p>
        </div>
      </div>

      {/* Re-evaluate button */}
      {onReEvaluate && (
        <button
          onClick={onReEvaluate}
          disabled={isReEvaluating}
          className="text-xs font-medium text-brand-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isReEvaluating ? "Re-evaluating..." : "Re-evaluate PMF Score"}
        </button>
      )}
    </div>
  );
}
