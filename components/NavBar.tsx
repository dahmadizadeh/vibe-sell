"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { COPY } from "@/lib/copy";

export function NavBar() {
  return (
    <nav className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-lg text-gray-900">
          {COPY.brandName}
        </span>
      </Link>
      <Link
        href="/projects"
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        {COPY.navMyProjects}
      </Link>
    </nav>
  );
}
