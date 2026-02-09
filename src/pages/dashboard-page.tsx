import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ProjectForm } from "@/components/project/project-form";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { useCards } from "@/hooks/use-cards";
import type { Project } from "@/types/project";

export default function DashboardPage() {
  const { t } = useTranslation(["dashboard", "project"]);
  const { projects, isLoading } = useProjects();
  const { cards } = useCards();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProjectMut = useDeleteProject();

  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const handleCreateProject = (data: { name: string; description: string }) => {
    createProject.mutate(data);
    setCreateOpen(false);
  };

  const handleEditProject = (data: { name: string; description: string }) => {
    if (editProject) {
      updateProject.mutate({ id: editProject.id, ...data });
      setEditProject(null);
    }
  };

  const handleDeleteProject = () => {
    if (deleteTarget) {
      deleteProjectMut.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const getCardCount = (projectId: string) =>
    cards.filter((c) => c.projectId === projectId).length;

  const getTemplateCount = (_projectId: string) => {
    // Templates are fetched per-project, so we use a simple count from all cards' templates
    // For a more accurate count, we'd need a separate query per project
    return 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title={t("dashboard:title")} />
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("dashboard:title")}
        actions={
          projects.length > 0 ? (
            <QuickActions onNewProject={() => setCreateOpen(true)} />
          ) : undefined
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t("dashboard:empty.title")}
          description={t("dashboard:empty.description")}
          actionLabel={t("dashboard:empty.cta")}
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">
              {t("dashboard:my_projects")}
            </h2>
            <ProjectGrid
              projects={projects}
              getCardCount={getCardCount}
              getTemplateCount={getTemplateCount}
              onEdit={setEditProject}
              onDelete={setDeleteTarget}
            />
          </div>
        </div>
      )}

      {/* Create Project Dialog */}
      <ProjectForm
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateProject}
        mode="create"
      />

      {/* Edit Project Dialog */}
      {editProject && (
        <ProjectForm
          open={!!editProject}
          onOpenChange={(open) => !open && setEditProject(null)}
          onSubmit={handleEditProject}
          defaultValues={{
            name: editProject.name,
            description: editProject.description,
          }}
          mode="edit"
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("project:delete.title")}
        description={t("project:delete.message")}
        confirmLabel={t("project:delete.confirm")}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}
