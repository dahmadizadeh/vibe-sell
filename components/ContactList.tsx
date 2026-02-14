"use client";

import { useState, useMemo } from "react";
import { ContactCard } from "./ContactCard";
import { COPY } from "@/lib/copy";
import type { Contact, RoleTag, EmailDraft } from "@/lib/types";

type SortOption = "relevance" | "companySize" | "recent";

interface ContactListProps {
  contacts: Contact[];
  onWriteEmail: (contact: Contact) => void;
  groupByRole?: boolean;
  companyName?: string;
  emailDrafts?: EmailDraft[];
}

const INITIAL_SHOW = 10;

function getDraftStatus(contactId: string, drafts?: EmailDraft[]) {
  if (!drafts) return undefined;
  const draft = drafts.find((d) => d.contactId === contactId);
  return draft?.status;
}

export function ContactList({ contacts, onWriteEmail, groupByRole, companyName, emailDrafts }: ContactListProps) {
  const [sort, setSort] = useState<SortOption>("relevance");
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const arr = [...contacts];
    switch (sort) {
      case "companySize":
        arr.sort((a, b) => b.companySize - a.companySize);
        break;
      case "recent":
        arr.sort((a, b) => b.relevance.localeCompare(a.relevance));
        break;
      default:
        arr.sort((a, b) => {
          if (a.relevance === b.relevance) return 0;
          return a.relevance === "strong" ? -1 : 1;
        });
    }
    return arr;
  }, [contacts, sort]);

  if (groupByRole) {
    const groups: { tag: RoleTag; label: string; contacts: Contact[] }[] = [
      { tag: "decision_maker", label: COPY.roleDecisionMaker, contacts: [] },
      { tag: "champion", label: COPY.roleChampion, contacts: [] },
      { tag: "technical_evaluator", label: COPY.roleTechnicalEvaluator, contacts: [] },
    ];
    for (const c of sorted) {
      const group = groups.find((g) => g.tag === c.roleTag);
      if (group) group.contacts.push(c);
      else groups[1].contacts.push(c);
    }
    return (
      <div>
        <h3 className="font-semibold text-gray-900 text-lg mb-4">
          {companyName ? COPY.resultsSellerContactsHeader(contacts.length, companyName) : `${contacts.length} contacts`}
        </h3>
        {groups.filter((g) => g.contacts.length > 0).map((group, gi) => (
          <div key={group.tag} className="mb-6">
            {gi > 0 && <div className="border-t border-gray-100 mb-4" />}
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                {group.label}s
              </h4>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {group.contacts.length}
              </span>
            </div>
            {group.contacts.map((contact, i) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                index={i}
                onWriteEmail={onWriteEmail}
                draftStatus={getDraftStatus(contact.id, emailDrafts)}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const visible = showAll ? sorted : sorted.slice(0, INITIAL_SHOW);

  return (
    <div>
      {/* Sort pills */}
      <div className="flex gap-2 mb-4">
        {(
          [
            { key: "relevance" as SortOption, label: COPY.resultsSortBestMatch },
            { key: "companySize" as SortOption, label: COPY.resultsSortCompanySize },
            { key: "recent" as SortOption, label: COPY.resultsSortRecentlyActive },
          ]
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              sort === opt.key
                ? "bg-brand-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {visible.map((contact, i) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          index={i}
          onWriteEmail={onWriteEmail}
          draftStatus={getDraftStatus(contact.id, emailDrafts)}
        />
      ))}

      {!showAll && contacts.length > INITIAL_SHOW && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 text-sm font-medium text-brand-primary hover:bg-blue-50 rounded-lg transition-colors"
        >
          {COPY.resultsShowAll(contacts.length)}
        </button>
      )}
    </div>
  );
}
