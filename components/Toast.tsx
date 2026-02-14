"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, visible, onHide }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (visible) {
      setExiting(false);
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(onHide, 200);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`
          flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-lg shadow-lg
          ${exiting ? "toast-exit" : "toast-enter"}
        `}
      >
        <Check className="w-4 h-4 text-brand-success" />
        {message}
      </div>
    </div>
  );
}
