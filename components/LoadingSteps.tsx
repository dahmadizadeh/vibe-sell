"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { ProjectMode } from "@/lib/types";
import { COPY } from "@/lib/copy";

interface LoadingStepsProps {
  mode: ProjectMode;
  company?: string;
}

export function LoadingSteps({ mode, company }: LoadingStepsProps) {
  const [completedSteps, setCompletedSteps] = useState(0);

  const rawSteps = mode === "builder" ? COPY.loadingBuilderSteps : COPY.loadingSellerSteps;
  const steps = rawSteps.map((s) => s.replace("{company}", company || "the company"));

  const timings = mode === "builder"
    ? [800, 1600, 2800, 3600]
    : [800, 1600, 2400, 3200, 4000];

  useEffect(() => {
    const timers = timings.map((ms, i) =>
      setTimeout(() => setCompletedSteps(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-4">
        {steps.map((step, i) => {
          const isCompleted = i < completedSteps;
          const isActive = i === completedSteps;
          const isPending = i > completedSteps;

          if (isPending && i !== completedSteps) return null;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isPending ? "opacity-0" : "opacity-100"
              }`}
              style={{
                animationDelay: `${i * 200}ms`,
              }}
            >
              <div className="shrink-0">
                {isCompleted ? (
                  <div className="w-7 h-7 rounded-full bg-brand-success flex items-center justify-center animate-check-in">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                ) : isActive ? (
                  <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-100" />
                )}
              </div>
              <span
                className={`text-base ${
                  isCompleted
                    ? "text-gray-900 font-medium"
                    : isActive
                    ? "text-brand-primary font-medium"
                    : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
