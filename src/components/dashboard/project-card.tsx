import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Layers, FileText } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  cardCount: number;
  templateCount: number;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({
  project,
  cardCount,
  templateCount,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const { t } = useTranslation("dashboard");

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link to={`/projects/${project.id}`} className="absolute inset-0 z-0" />

      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-lg">{project.name}</CardTitle>
          {project.description && (
            <CardDescription className="mt-1 line-clamp-2">
              {project.description}
            </CardDescription>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative z-10 h-8 w-8 opacity-0 group-hover:opacity-100"
              aria-label="Project actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(project)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {t("project_card.cards_count", { count: cardCount })}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            {t("project_card.templates_count", { count: templateCount })}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(project.updatedAt), {
            addSuffix: true,
          })}
        </p>
      </CardContent>
    </Card>
  );
}
