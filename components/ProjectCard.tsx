"use client";

import { Target, FileText } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { COPY } from "@/lib/copy";
import type { Project } from "@/lib/types";
import { truncate } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onOpen: (id: string) => void;
  onFindMore?: (id: string) => void;
  onReuse?: (id: string) => void;
}

export function ProjectCard({ project, onOpen, onFindMore, onReuse }: ProjectCardProps) {
  const isBuilder = project.mode === "builder";
  const date = new Date(project.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="p-5 flex flex-col h-full">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isBuilder ? "bg-brand-primary/10" : "bg-purple-50"
        }`}>
          {isBuilder ? (
            <Target className="w-4.5 h-4.5 text-brand-primary" />
          ) : (
            <FileText className="w-4.5 h-4.5 text-purple-600" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-base">
            {project.productPage?.name || project.title}
          </h3>
          {isBuilder ? (
            <p className="text-sm text-gray-500 mt-0.5">
              {truncate(project.targeting.summary || project.description, 80)}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1 mt-1">
              {project.targetCompanies?.map((c) => (
                <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-400 space-y-0.5 mb-4">
        <div>
          {project.stats.contactsFound} {isBuilder ? "customers" : "contacts"} found
          {project.stats.emailsSent > 0 && ` · ${project.stats.emailsSent} emails sent`}
          {project.stats.replies > 0 && ` · ${project.stats.replies} replies`}
          {project.stats.meetingsBooked > 0 && ` · ${project.stats.meetingsBooked} meeting${project.stats.meetingsBooked > 1 ? "s" : ""}`}
        </div>
        <div className="text-xs">{date}</div>
      </div>

      <div className="mt-auto flex gap-2">
        {isBuilder && onFindMore && (
          <Button variant="secondary" size="sm" onClick={() => onFindMore(project.id)}>
            {COPY.workspaceBuilderFindMore}
          </Button>
        )}
        {!isBuilder && onReuse && (
          <Button variant="secondary" size="sm" onClick={() => onReuse(project.id)}>
            {COPY.workspaceSellerReuse}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onOpen(project.id)}>
          {isBuilder ? COPY.workspaceBuilderOpen : COPY.workspaceSellerOpen}
        </Button>
      </div>
    </Card>
  );
}
