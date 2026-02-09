import type { Project } from "@/types/project";
import { ProjectCard } from "./project-card";

interface ProjectGridProps {
  projects: Project[];
  getCardCount: (projectId: string) => number;
  getTemplateCount: (projectId: string) => number;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectGrid({
  projects,
  getCardCount,
  getTemplateCount,
  onEdit,
  onDelete,
}: ProjectGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          cardCount={getCardCount(project.id)}
          templateCount={getTemplateCount(project.id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
