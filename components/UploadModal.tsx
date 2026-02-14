"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Contact } from "@/lib/types";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transcript: string, contactId?: string) => void;
  isAnalyzing: boolean;
  contacts: Contact[];
}

export function UploadModal({ open, onClose, onSubmit, isAnalyzing, contacts }: UploadModalProps) {
  const [transcript, setTranscript] = useState("");
  const [contactId, setContactId] = useState<string>("");
  const [source, setSource] = useState<"notes" | "audio" | "record">("notes");

  if (!open) return null;

  const handleSubmit = () => {
    if (!transcript.trim()) return;
    onSubmit(transcript.trim(), contactId || undefined);
    setTranscript("");
    setContactId("");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white z-50 shadow-2xl slide-over-enter flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">Log a Conversation</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Paste your notes from a customer conversation
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Source Selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Source
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSource("notes")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  source === "notes"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Paste Notes
              </button>
              <button
                disabled
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed"
              >
                Upload Audio
                <span className="ml-1 text-[10px]">(Coming Soon)</span>
              </button>
              <button
                disabled
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed"
              >
                Record
                <span className="ml-1 text-[10px]">(Coming Soon)</span>
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Conversation Notes
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={12}
              placeholder="Paste your conversation notes, call transcript, or meeting summary here..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed resize-y whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary placeholder-gray-400"
            />
          </div>

          {/* Contact Linking */}
          {contacts.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Link to Contact (Optional)
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary bg-white"
              >
                <option value="">No contact linked</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} &mdash; {c.title} at {c.company}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={!transcript.trim() || isAnalyzing}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Conversation"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
