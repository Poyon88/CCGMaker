import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Plus, MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { CardRenderer } from "@/components/card/card-renderer";
import { useTemplates, useCreateTemplate, useDeleteTemplate } from "@/hooks/use-templates";
import type { Template } from "@/types/template";

export default function TemplateListPage() {
  const { projectId } = useParams();
  const { t } = useTranslation(["project", "common"]);
  const { templates, isLoading } = useTemplates(projectId);
  const createTemplate = useCreateTemplate();
  const deleteTemplateMut = useDeleteTemplate();
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const handleDuplicate = (tpl: Template) => {
    const now = new Date().toISOString();
    createTemplate.mutate({
      ...tpl,
      id: crypto.randomUUID(),
      name: `${tpl.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTemplateMut.mutate({ id: deleteTarget.id, projectId: projectId! });
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t("project:template.empty.title")}
        description={t("project:template.empty.description")}
        actionLabel={t("project:template.empty.cta")}
        actionHref={`/projects/${projectId}/templates/new`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to={`/projects/${projectId}/templates/new`}>
          <Button size="sm">
            <Plus className="mr-1 h-3 w-3" />
            {t("project:template.new")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <div key={tpl.id} className="group relative rounded-lg border bg-card p-3">
            {/* Thumbnail */}
            <Link to={`/projects/${projectId}/templates/${tpl.id}`}>
              <div className="mb-3 flex justify-center rounded bg-muted/30 p-2">
                <CardRenderer definition={tpl.definition} scale={0.4} />
              </div>
            </Link>

            {/* Info */}
            <div className="flex items-start justify-between">
              <Link to={`/projects/${projectId}/templates/${tpl.id}`} className="flex-1">
                <h3 className="font-medium hover:underline">{tpl.name || "Untitled"}</h3>
                {tpl.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {tpl.description}
                  </p>
                )}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${tpl.name || "Untitled"}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/projects/${projectId}/templates/${tpl.id}`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t("common:actions.edit")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(tpl)}>
                    <Copy className="mr-2 h-4 w-4" />
                    {t("common:actions.duplicate")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget(tpl)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("common:actions.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("project:template.delete.title")}
        description={t("project:template.delete.message")}
        confirmLabel={t("project:template.delete.confirm")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
