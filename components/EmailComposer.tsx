"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Copy, ExternalLink, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "./Button";
import { COPY } from "@/lib/copy";
import type { Contact, EmailDraft } from "@/lib/types";

interface EmailComposerProps {
  draft: EmailDraft | null;
  contact: Contact | null;
  contacts: Contact[];
  onClose: () => void;
  onNavigate: (contactId: string) => void;
  onUpdateDraft: (contactId: string, updates: Partial<EmailDraft>) => void;
  onMarkDrafted?: (contactId: string) => void;
}

export function EmailComposer({
  draft,
  contact,
  contacts,
  onClose,
  onNavigate,
  onUpdateDraft,
  onMarkDrafted,
}: EmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (draft) {
      setSubject(draft.subject);
      setBody(draft.body);
      setCopied(false);
    }
  }, [draft]);

  const handleCopy = useCallback(() => {
    const text = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onMarkDrafted && draft) {
      onMarkDrafted(draft.contactId);
    }
    setTimeout(() => setCopied(false), 2000);
  }, [subject, body, onMarkDrafted, draft]);

  const handleOpenGmail = useCallback(() => {
    if (!contact) return;
    const mailtoUrl = `mailto:${contact.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    if (onMarkDrafted && draft) {
      onMarkDrafted(draft.contactId);
    }
  }, [contact, subject, body, onMarkDrafted, draft]);

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    if (draft) onUpdateDraft(draft.contactId, { subject: value });
  };

  const handleBodyChange = (value: string) => {
    setBody(value);
    if (draft) onUpdateDraft(draft.contactId, { body: value });
  };

  const currentIndex = contacts.findIndex((c) => c.id === contact?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < contacts.length - 1;

  const navigate = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < contacts.length) {
      onNavigate(contacts[newIndex].id);
    }
  };

  if (!draft || !contact) return null;

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
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{COPY.emailComposerTitle}</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full inline-block">
            {contact.name}, {contact.title} at {contact.company}
          </div>
        </div>

        {/* Email content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              rows={14}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 leading-relaxed resize-y whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            />
          </div>

          {/* Contact context */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">About this contact</div>
            <div className="space-y-1 text-sm text-gray-600">
              <div><span className="text-gray-400">Name:</span> {contact.name}</div>
              <div><span className="text-gray-400">Title:</span> {contact.title}</div>
              <div><span className="text-gray-400">Company:</span> {contact.company}</div>
              <div><span className="text-gray-400">Industry:</span> {contact.industry}</div>
              <div><span className="text-gray-400">Size:</span> {contact.companySize.toLocaleString()} employees</div>
              {contact.roleTag && (
                <div><span className="text-gray-400">Role:</span> {
                  contact.roleTag === "decision_maker" ? COPY.roleDecisionMaker :
                  contact.roleTag === "champion" ? COPY.roleChampion :
                  COPY.roleTechnicalEvaluator
                }</div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">{contact.matchReason}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-3">
          <div className="flex gap-2">
            <Button fullWidth onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  {COPY.emailCopied}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {COPY.emailCopy}
                </>
              )}
            </Button>
            <Button variant="secondary" fullWidth onClick={handleOpenGmail}>
              <ExternalLink className="w-4 h-4" />
              {COPY.emailOpenGmail}
            </Button>
          </div>
          {contacts.length > 1 && (
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" disabled={!hasPrev} onClick={() => navigate("prev")}>
                <ChevronLeft className="w-4 h-4" />
                {COPY.emailPrevious}
              </Button>
              <span className="text-xs text-gray-400 self-center">
                {currentIndex + 1} of {contacts.length}
              </span>
              <Button variant="ghost" size="sm" disabled={!hasNext} onClick={() => navigate("next")}>
                {COPY.emailNext}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
