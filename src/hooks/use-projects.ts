import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestStore } from "@/stores/guest-store";
import * as svc from "@/services/projects.service";
import { mapDbProject, mapProjectToInsert } from "@/lib/mappers";
import type { Project } from "@/types/project";

export function useProjects() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const guestProjects = useGuestStore((s) => s.projects);

  const query = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const rows = await svc.fetchProjects();
      return rows.map(mapDbProject);
    },
    enabled: !isGuest,
  });

  return {
    projects: isGuest ? guestProjects : (query.data ?? []),
    isLoading: isGuest ? false : query.isLoading,
  };
}

export function useProject(id: string | undefined) {
  const isGuest = useAuthStore((s) => s.isGuest);
  const guestProject = useGuestStore((s) =>
    s.projects.find((p) => p.id === id)
  );

  const query = useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const row = await svc.fetchProject(id!);
      return mapDbProject(row);
    },
    enabled: !isGuest && !!id,
  });

  return {
    project: isGuest ? (guestProject ?? null) : (query.data ?? null),
    isLoading: isGuest ? false : query.isLoading,
  };
}

export function useCreateProject() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const userId = useAuthStore((s) => s.user?.id);
  const addProject = useGuestStore((s) => s.addProject);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const now = new Date().toISOString();
      const project: Project = {
        id: crypto.randomUUID(),
        userId: isGuest ? "guest" : userId!,
        name: data.name,
        description: data.description,
        createdAt: now,
        updatedAt: now,
      };

      if (isGuest) {
        addProject(project);
        return project;
      }

      const row = await svc.createProject(mapProjectToInsert(project));
      return mapDbProject(row);
    },
    onSuccess: () => {
      if (!isGuest) qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
    },
    onError: (err) => {
      toast.error(`Failed to create project: ${err.message}`);
    },
  });
}

export function useUpdateProject() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const updateProject = useGuestStore((s) => s.updateProject);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name: string;
      description: string;
    }) => {
      if (isGuest) {
        updateProject(id, {
          name: data.name,
          description: data.description,
          updatedAt: new Date().toISOString(),
        });
        return;
      }
      await svc.updateProject(id, {
        name: data.name,
        description: data.description,
      });
    },
    onSuccess: () => {
      if (!isGuest) qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated");
    },
    onError: (err) => {
      toast.error(`Failed to update project: ${err.message}`);
    },
  });
}

export function useDeleteProject() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const deleteProject = useGuestStore((s) => s.deleteProject);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuest) {
        deleteProject(id);
        return;
      }
      await svc.deleteProject(id);
    },
    onSuccess: () => {
      if (!isGuest) qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (err) => {
      toast.error(`Failed to delete project: ${err.message}`);
    },
  });
}
