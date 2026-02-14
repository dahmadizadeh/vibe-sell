interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({ children, className = "", onClick, selected }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border rounded-xl shadow-sm
        ${selected ? "border-2 border-brand-primary" : "border-[#E2E8F0]"}
        ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
