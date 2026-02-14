"use client";

import { useState } from "react";
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

function getContextBadge(contact: Contact): { label: string; color: string } {
  const category = contact.contactCategory;

  if (category === "investors") {
    return { label: "Thesis Match", color: "bg-purple-100 text-purple-700" };
  }

  if (category === "teammates") {
    if (contact.roleTag === "technical_evaluator") {
      return { label: "Builder", color: "bg-orange-100 text-orange-700" };
    }
    return { label: "Grower", color: "bg-teal-100 text-teal-700" };
  }

  // Users/customers (default)
  if (contact.companySize > 0 && contact.companySize <= 50) {
    return { label: "Early Adopter", color: "bg-green-100 text-green-700" };
  }
  if (contact.relevance === "strong") {
    return { label: "Strong Match", color: "bg-brand-success text-white" };
  }
  return { label: "Good Match", color: "bg-brand-primary text-white" };
}

function draftStatusBadge(status?: DraftStatus): { label: string; color: string; icon: typeof Check } | null {
  if (status === "drafted") return { label: COPY.contactDrafted, color: "bg-amber-100 text-amber-700", icon: Check };
  if (status === "sent") return { label: COPY.contactSent, color: "bg-green-100 text-green-700", icon: Send };
  return null;
}

export function ContactCard({ contact, index, onWriteEmail, draftStatus }: ContactCardProps) {
  const badge = getContextBadge(contact);
  const dBadge = draftStatusBadge(draftStatus);
  const [imgError, setImgError] = useState(false);

  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="border border-[#E2E8F0] rounded-lg p-4 mb-3 animate-slide-up hover:border-gray-300 transition-colors"
      style={{ animationDelay: staggerDelay(index) }}
    >
      <div className="flex items-start gap-3 mb-2">
        {/* Profile photo */}
        {contact.profilePhotoUrl && !imgError ? (
          <img
            src={contact.profilePhotoUrl}
            alt={contact.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-600 font-semibold text-sm">{initials}</span>
          </div>
        )}

        <div className="min-w-0 flex-1">
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
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
            {badge.label}
          </span>
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
