"use client";

import { useState } from "react";
import type { Conversation, Contact } from "@/lib/types";
import { staggerDelay } from "@/lib/utils";

interface ConversationCardProps {
  conversation: Conversation;
  contacts: Contact[];
  index: number;
}

const SIGNAL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  positive: { color: "text-emerald-700", bg: "bg-emerald-50", label: "+" },
  negative: { color: "text-red-700", bg: "bg-red-50", label: "-" },
  neutral: { color: "text-gray-600", bg: "bg-gray-50", label: "~" },
  idea: { color: "text-purple-700", bg: "bg-purple-50", label: "!" },
};

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  strong_positive: { label: "Very Positive", color: "text-emerald-700", bg: "bg-emerald-50" },
  positive: { label: "Positive", color: "text-emerald-600", bg: "bg-emerald-50" },
  neutral: { label: "Neutral", color: "text-gray-600", bg: "bg-gray-100" },
  negative: { label: "Negative", color: "text-red-600", bg: "bg-red-50" },
  strong_negative: { label: "Very Negative", color: "text-red-700", bg: "bg-red-50" },
};

export function ConversationCard({ conversation, contacts, index }: ConversationCardProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  const contact = conversation.contactId
    ? contacts.find((c) => c.id === conversation.contactId)
    : null;
  const displayName = conversation.contactName || contact?.name;
  const sentiment = SENTIMENT_CONFIG[conversation.analysis.overallSentiment] || SENTIMENT_CONFIG.neutral;
  const date = new Date(conversation.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-fade-in"
      style={{ animationDelay: staggerDelay(index) }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900">
            Conversation #{index + 1}
          </span>
          <span className="text-gray-300">&middot;</span>
          <span className="text-xs text-gray-500">{date}</span>
          {displayName && (
            <>
              <span className="text-gray-300">&middot;</span>
              <span className="text-xs text-gray-600 font-medium">{displayName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sentiment.color} ${sentiment.bg}`}>
            {sentiment.label}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
            {conversation.source === "notes" ? "Notes" : conversation.source === "audio" ? "Audio" : "Live"}
          </span>
        </div>
      </div>

      {/* Key Insights */}
      <div className="px-4 py-3 space-y-1.5">
        {conversation.analysis.keyInsights.map((insight, i) => {
          const config = SIGNAL_CONFIG[insight.signal] || SIGNAL_CONFIG.neutral;
          return (
            <div key={i} className={`flex items-start gap-2 text-sm px-2 py-1.5 rounded-lg ${config.bg}`}>
              <span className={`font-bold shrink-0 mt-px ${config.color}`}>{config.label}</span>
              <span className={config.color}>{insight.text}</span>
            </div>
          );
        })}
      </div>

      {/* Best Quote */}
      {conversation.analysis.bestQuote && (
        <div className="mx-4 mb-3 px-4 py-3 border-l-4 border-brand-primary/30 bg-blue-50/50 rounded-r-lg">
          <p className="text-sm text-gray-700 italic leading-relaxed">
            &ldquo;{conversation.analysis.bestQuote}&rdquo;
          </p>
        </div>
      )}

      {/* Feature Requests */}
      {conversation.analysis.featureRequests.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {conversation.analysis.featureRequests.map((feature, i) => (
            <span
              key={i}
              className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
      )}

      {/* Details row */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-400">
        {conversation.analysis.willingnessToPay && (
          <span>Pay: {conversation.analysis.willingnessToPay}</span>
        )}
        {conversation.analysis.currentSolution && (
          <span>Using: {conversation.analysis.currentSolution}</span>
        )}
      </div>

      {/* Expandable Transcript */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full px-4 py-2.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors text-left font-medium"
        >
          {showTranscript ? "Hide Transcript" : "Show Transcript"}
        </button>
        {showTranscript && (
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
              {conversation.transcript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
