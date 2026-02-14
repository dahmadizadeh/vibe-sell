"use client";

interface CompanyTabsProps {
  companies: string[];
  active: string;
  onChange: (company: string) => void;
}

export function CompanyTabs({ companies, active, onChange }: CompanyTabsProps) {
  if (companies.length <= 1) return null;

  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      {companies.map((company) => (
        <button
          key={company}
          onClick={() => onChange(company)}
          className={`
            px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
            ${
              active === company
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }
          `}
        >
          {company}
        </button>
      ))}
    </div>
  );
}
