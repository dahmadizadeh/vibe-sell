"use client";

import { useState } from "react";

interface CompetitorPillsProps {
  competitors: string[];
  editing: boolean;
  onToggleEdit: () => void;
  onRemove: (idx: number) => void;
  onAdd: (name: string) => void;
  variant?: "default" | "orange";
  loading?: boolean;
}

export function CompetitorPills({
  competitors,
  editing,
  onToggleEdit,
  onRemove,
  onAdd,
  variant = "default",
  loading = false,
}: CompetitorPillsProps) {
  const [newName, setNewName] = useState("");

  const pillBg = variant === "orange" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-400">Competitors</span>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          )}
          <button
            onClick={onToggleEdit}
            className="text-xs text-brand-primary hover:underline"
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {competitors.map((c, i) => (
          <span key={i} className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${pillBg}`}>
            {c}
            {editing && (
              <button
                onClick={() => onRemove(i)}
                className="text-gray-400 hover:text-red-500 ml-0.5"
              >
                x
              </button>
            )}
          </span>
        ))}
        {editing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newName.trim()) {
                onAdd(newName.trim());
                setNewName("");
              }
            }}
            className="flex items-center gap-1"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="+ Add"
              className="w-20 px-2 py-0.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
            />
          </form>
        )}
      </div>
    </div>
  );
}
