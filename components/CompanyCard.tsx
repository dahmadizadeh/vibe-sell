"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import type { Contact } from "@/lib/types";

interface CompanyCardProps {
  name: string;
  contacts: Contact[];
  industry?: string;
  headcount?: number;
  hq?: string;
  website?: string;
  logoUrl?: string;
  totalFunding?: number;
  headcountGrowth?: number;
  onWriteEmail?: (contact: Contact) => void;
}

export function CompanyCard({
  name,
  contacts,
  industry,
  headcount,
  hq,
  website,
  logoUrl,
  totalFunding,
  headcountGrowth,
  onWriteEmail,
}: CompanyCardProps) {
  const [expanded, setExpanded] = useState(false);

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* Logo or initials */}
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={name}
            className="w-10 h-10 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm shrink-0">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{name}</h3>
            <span className="text-xs bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full font-medium shrink-0">
              {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            {industry && <span>{industry}</span>}
            {headcount && <span>{headcount.toLocaleString()} employees</span>}
            {hq && <span>{hq}</span>}
            {totalFunding && <span>${(totalFunding / 1_000_000).toFixed(1)}M funding</span>}
            {headcountGrowth !== undefined && headcountGrowth !== 0 && (
              <span className={headcountGrowth > 0 ? "text-green-600" : "text-red-500"}>
                {headcountGrowth > 0 ? "+" : ""}{(headcountGrowth * 100).toFixed(0)}% growth
              </span>
            )}
          </div>

          {website && (
            <a
              href={`https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-primary hover:underline mt-0.5 inline-block"
            >
              {website}
            </a>
          )}
        </div>
      </div>

      {/* Expandable contact list */}
      {contacts.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-brand-primary hover:underline"
          >
            {expanded ? "Hide contacts" : `Show ${contacts.length} contacts`}
          </button>

          {expanded && (
            <div className="mt-2 space-y-2 border-t border-gray-100 pt-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500 truncate">{contact.title}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-2">
                    {contact.linkedinUrl && (
                      <a
                        href={contact.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {onWriteEmail && (
                      <button
                        onClick={() => onWriteEmail(contact)}
                        className="text-xs text-brand-primary hover:underline"
                      >
                        Email
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
