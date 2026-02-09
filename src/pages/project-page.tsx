import { useParams } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { PageHeader } from "@/components/common/page-header";
import { ProjectTabs } from "@/components/project/project-tabs";
import { useProject } from "@/hooks/use-projects";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );
  }

  if (!project) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description || undefined}
      />
      <ProjectTabs />
      <Outlet />
    </div>
  );
}
