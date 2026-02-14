"use client";

import { Linkedin, Mail, Check, Send } from "lucide-react";
import { Button } from "./Button";
import { COPY } from "@/lib/copy";
import type { Contact, DraftStatus } from "@/lib/types";
import { formatCompanySize, staggerDelay } from "@/lib/utils";

interface ContactCardProps {
  contact: Contact;
  index: number;
  onWriteEmail: (contact: Contact) => void;
  draftStatus?: DraftStatus;
}

function roleTagLabel(tag: Contact["roleTag"]): string {
  switch (tag) {
    case "decision_maker": return COPY.roleDecisionMaker;
    case "champion": return COPY.roleChampion;
    case "technical_evaluator": return COPY.roleTechnicalEvaluator;
    default: return "";
  }
}

function roleTagColor(tag: Contact["roleTag"]): string {
  switch (tag) {
    case "decision_maker": return "bg-role-decision text-white";
    case "champion": return "bg-role-champion text-white";
    case "technical_evaluator": return "bg-role-technical text-white";
    default: return "bg-gray-500 text-white";
  }
}

function relevanceBadge(level: Contact["relevance"]): { label: string; color: string } {
  if (level === "strong") return { label: COPY.contactStrongMatch, color: "bg-brand-success text-white" };
  return { label: COPY.contactGoodMatch, color: "bg-brand-primary text-white" };
}

function draftStatusBadge(status?: DraftStatus): { label: string; color: string; icon: typeof Check } | null {
  if (status === "drafted") return { label: COPY.contactDrafted, color: "bg-amber-100 text-amber-700", icon: Check };
  if (status === "sent") return { label: COPY.contactSent, color: "bg-green-100 text-green-700", icon: Send };
  return null;
}

export function ContactCard({ contact, index, onWriteEmail, draftStatus }: ContactCardProps) {
  const badge = relevanceBadge(contact.relevance);
  const dBadge = draftStatusBadge(draftStatus);

  return (
    <div
      className="border border-[#E2E8F0] rounded-lg p-4 mb-3 animate-slide-up hover:border-gray-300 transition-colors"
      style={{ animationDelay: staggerDelay(index) }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-gray-900">{contact.name}</span>
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A66C2] hover:opacity-80 shrink-0"
              title="View on LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            {dBadge && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${dBadge.color}`}>
                <dBadge.icon className="w-3 h-3" />
                {dBadge.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {contact.title} at {contact.company}
          </p>
          <p className="text-sm text-gray-400">
            {formatCompanySize(contact.companySize)} · {contact.industry}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
          {contact.roleTag && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleTagColor(contact.roleTag)}`}>
              {roleTagLabel(contact.roleTag)}
            </span>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mb-3">
        {contact.matchReason}
      </p>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => onWriteEmail(contact)}>
          <Mail className="w-3.5 h-3.5" />
          {COPY.contactWriteEmail}
        </Button>
      </div>
    </div>
  );
}
