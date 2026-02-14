"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/types";
import { ConversationCard } from "./ConversationCard";
import { PMFDashboard } from "./PMFDashboard";
import { UploadModal } from "./UploadModal";

interface ConversationsTabProps {
  project: Project;
  onAddConversation: (transcript: string, contactId?: string) => Promise<void>;
  onReEvaluate: () => Promise<void>;
}

export function ConversationsTab({
  project,
  onAddConversation,
  onReEvaluate,
}: ConversationsTabProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[] | undefined>(
    project.suggestedQuestions
  );
  const [showQuestions, setShowQuestions] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const conversations = project.conversations || [];
  const conversationCount = conversations.length;

  // Lazy-fetch suggested questions for pre-existing projects
  useEffect(() => {
    if (suggestedQuestions || !project.productPage?.name) return;

    fetch("/api/analyze-viability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: project.description,
        appName: project.productPage.name,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.suggestedQuestions) {
          setSuggestedQuestions(result.suggestedQuestions);
        }
      })
      .catch(() => {});
  }, [suggestedQuestions, project.productPage?.name, project.description]);

  // Update suggestedQuestions when project changes
  useEffect(() => {
    if (project.suggestedQuestions) {
      setSuggestedQuestions(project.suggestedQuestions);
    }
  }, [project.suggestedQuestions]);

  const handleSubmit = useCallback(
    async (transcript: string, contactId?: string) => {
      setIsAnalyzing(true);
      try {
        await onAddConversation(transcript, contactId);
        setShowUploadModal(false);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [onAddConversation]
  );

  const handleReEvaluate = useCallback(async () => {
    setIsReEvaluating(true);
    try {
      await onReEvaluate();
    } finally {
      setIsReEvaluating(false);
    }
  }, [onReEvaluate]);

  const handleCopyQuestion = (question: string, idx: number) => {
    navigator.clipboard.writeText(question);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // ─── Empty State ────────────────────────────────────────────────────────────
  if (conversationCount === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">&#x1F4AC;</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Talk to your future customers
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
            Log conversations with potential users to extract insights, track sentiment,
            and measure product-market fit over time.
          </p>

          {/* Method cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
            <button
              onClick={() => setShowUploadModal(true)}
              className="rounded-xl border-2 border-brand-primary/20 bg-brand-primary/5 p-4 text-center hover:bg-brand-primary/10 transition-colors"
            >
              <div className="text-2xl mb-2">&#x1F4DD;</div>
              <div className="text-sm font-medium text-gray-900">Paste Notes</div>
              <div className="text-xs text-gray-500 mt-0.5">From any conversation</div>
            </button>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center opacity-60">
              <div className="text-2xl mb-2">&#x1F3A4;</div>
              <div className="text-sm font-medium text-gray-400">Upload Audio</div>
              <div className="text-xs text-gray-400 mt-0.5">Coming soon</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center opacity-60">
              <div className="text-2xl mb-2">&#x1F534;</div>
              <div className="text-sm font-medium text-gray-400">Record Live</div>
              <div className="text-xs text-gray-400 mt-0.5">Coming soon</div>
            </div>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors"
          >
            Log Your First Conversation
          </button>
        </div>

        {/* Suggested Questions (even in empty state) */}
        {suggestedQuestions && suggestedQuestions.length > 0 && (
          <div className="mt-6">
            <QuestionsSection
              questions={suggestedQuestions}
              showQuestions={showQuestions}
              setShowQuestions={setShowQuestions}
              copiedIdx={copiedIdx}
              onCopy={handleCopyQuestion}
            />
          </div>
        )}

        <UploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleSubmit}
          isAnalyzing={isAnalyzing}
          contacts={project.contacts}
        />
      </>
    );
  }

  // ─── Conversations Exist ────────────────────────────────────────────────────
  return (
    <>
      {/* PMF Dashboard */}
      {project.pmfScore && conversationCount >= 3 && (
        <PMFDashboard
          pmfScore={project.pmfScore}
          conversationCount={conversationCount}
          onReEvaluate={handleReEvaluate}
          isReEvaluating={isReEvaluating}
        />
      )}

      {/* Log a Conversation button + PMF unlock message */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Conversations
          </h2>
          {conversationCount < 3 && (
            <p className="text-sm text-gray-500 mt-0.5">
              Log {3 - conversationCount} more to unlock your PMF score
            </p>
          )}
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors"
        >
          Log a Conversation
        </button>
      </div>

      {/* Conversation Cards (reverse chronological) */}
      <div className="space-y-4 mb-6">
        {[...conversations].reverse().map((convo, i) => (
          <ConversationCard
            key={convo.id}
            conversation={convo}
            contacts={project.contacts}
            index={i}
          />
        ))}
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <QuestionsSection
          questions={suggestedQuestions}
          showQuestions={showQuestions}
          setShowQuestions={setShowQuestions}
          copiedIdx={copiedIdx}
          onCopy={handleCopyQuestion}
        />
      )}

      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleSubmit}
        isAnalyzing={isAnalyzing}
        contacts={project.contacts}
      />
    </>
  );
}

// ─── Suggested Questions Section ──────────────────────────────────────────────

function QuestionsSection({
  questions,
  showQuestions,
  setShowQuestions,
  copiedIdx,
  onCopy,
}: {
  questions: string[];
  showQuestions: boolean;
  setShowQuestions: (v: boolean) => void;
  copiedIdx: number | null;
  onCopy: (q: string, i: number) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setShowQuestions(!showQuestions)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <span>Suggested Questions (Mom Test)</span>
        <span className="text-gray-400 text-xs">
          {showQuestions ? "Hide" : "Show"}
        </span>
      </button>
      {showQuestions && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-gray-400 mb-2">
            Good questions are about their life, not your product.
          </p>
          {questions.map((q, i) => (
            <div
              key={i}
              className="flex items-start gap-2 group"
            >
              <span className="text-brand-primary font-medium text-sm shrink-0 mt-0.5">
                {i + 1}.
              </span>
              <p className="text-sm text-gray-700 leading-relaxed flex-1">{q}</p>
              <button
                onClick={() => onCopy(q, i)}
                className="text-[10px] px-2 py-1 rounded text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
              >
                {copiedIdx === i ? "Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
