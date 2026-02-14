"use client";

import { Card } from "@/components/Card";
import type { FounderProfile } from "@/lib/types";

interface FounderCardProps {
  founder: FounderProfile;
  onRemove?: () => void;
}

export function FounderCard({ founder, onRemove }: FounderCardProps) {
  const initials = founder.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avgReactions = founder.recentPosts && founder.recentPosts.length > 0
    ? Math.round(founder.recentPosts.reduce((a, p) => a + p.reactions, 0) / founder.recentPosts.length)
    : null;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* Photo or initials */}
        {founder.profilePhotoUrl ? (
          <img
            src={founder.profilePhotoUrl}
            alt={founder.name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm shrink-0">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{founder.name}</h3>
            {onRemove && (
              <button
                onClick={onRemove}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
          {founder.headline && (
            <p className="text-xs text-gray-500 truncate">{founder.headline}</p>
          )}
          {founder.company && (
            <p className="text-xs text-brand-primary font-medium mt-0.5">{founder.company}</p>
          )}
        </div>

        <a
          href={founder.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline shrink-0"
        >
          LinkedIn
        </a>
      </div>

      {/* Past companies */}
      {founder.pastCompanies && founder.pastCompanies.length > 0 && (
        <div className="mt-3">
          <span className="text-xs font-medium text-gray-400">Past companies</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {founder.pastCompanies.map((c, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {founder.education && founder.education.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium text-gray-400">Education</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {founder.education.map((e, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {founder.skills && founder.skills.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium text-gray-400">Top skills</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {founder.skills.slice(0, 6).map((s, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent post performance */}
      {avgReactions !== null && (
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
          <span>{founder.recentPosts!.length} recent posts</span>
          <span>Avg {avgReactions} reactions</span>
          <span>Avg {Math.round(founder.recentPosts!.reduce((a, p) => a + p.comments, 0) / founder.recentPosts!.length)} comments</span>
        </div>
      )}
    </Card>
  );
}
