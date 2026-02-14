"use client";

interface ExampleChipProps {
  label: string;
  onClick: () => void;
}

export function ExampleChip({ label, onClick }: ExampleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-all"
    >
      {label}
    </button>
  );
}
