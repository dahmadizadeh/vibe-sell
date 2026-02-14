"use client";

import { useState, useCallback } from "react";
import type { PostTemplate } from "@/lib/types";

interface PostCardProps {
  post: PostTemplate;
  onUpdate?: (updated: PostTemplate) => void;
}

const PLATFORM_CONFIG: Record<string, { emoji: string; color: string; openUrl?: string }> = {
  LinkedIn: { emoji: "\uD83D\uDD17", color: "#0077B5", openUrl: "https://www.linkedin.com/feed/" },
  "LinkedIn DM": { emoji: "\u2709\uFE0F", color: "#0077B5", openUrl: "https://www.linkedin.com/messaging/" },
  "Twitter/X": { emoji: "\uD83D\uDC26", color: "#1DA1F2", openUrl: "https://twitter.com/compose/tweet" },
  Reddit: { emoji: "\uD83E\uDD16", color: "#FF4500", openUrl: "https://www.reddit.com/submit" },
  Discord: { emoji: "\uD83D\uDCAC", color: "#5865F2" },
  Facebook: { emoji: "\uD83D\uDCD8", color: "#1877F2" },
};

export function PostCard({ post, onUpdate }: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [copied, setCopied] = useState(false);

  const config = PLATFORM_CONFIG[post.platform] || { emoji: "\uD83D\uDCDD", color: "#6b7280" };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  const handleSave = useCallback(() => {
    setEditing(false);
    if (onUpdate) {
      onUpdate({ ...post, content });
    }
  }, [post, content, onUpdate]);

  const handleOpen = useCallback(() => {
    if (config.openUrl) {
      window.open(config.openUrl, "_blank");
    }
  }, [config.openUrl]);

  // Format tweet threads nicely
  const isThread = post.platform === "Twitter/X";
  const displayContent = isThread
    ? content.split(/\n\n(?=Tweet \d)/i)
    : [content];

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: `${config.color}15` }}
          >
            {config.emoji}
          </span>
          <span className="font-medium text-sm text-gray-900">{post.platform}</span>
          <span className="text-gray-300">&middot;</span>
          <span className="text-xs text-gray-500">{post.purpose}</span>
        </div>
        {post.communityName && (
          <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">
            {post.communityName}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {editing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[160px] text-sm text-gray-700 leading-relaxed border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-y"
          />
        ) : isThread ? (
          <div className="space-y-3">
            {displayContent.map((tweet, i) => (
              <div key={i} className="text-sm text-gray-700 leading-relaxed">
                {i > 0 && (
                  <div className="w-px h-3 bg-gray-200 ml-3 -mt-1.5 mb-1.5" />
                )}
                <div className={i === 0 ? "font-medium" : ""}>
                  {tweet.trim()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{post.bestTimeToPost}</span>
            <span>&middot;</span>
            <span>{post.expectedReach}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Target: {post.targetAudience}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            {copied ? "Copied!" : "Copy Post"}
          </button>
          {config.openUrl && (
            <button
              onClick={handleOpen}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Open {post.platform.split(" ")[0]}
            </button>
          )}
          <button
            onClick={editing ? handleSave : () => setEditing(true)}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ml-auto"
          >
            {editing ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}
