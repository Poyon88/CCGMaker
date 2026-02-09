import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestStore } from "@/stores/guest-store";
import * as svc from "@/services/templates.service";
import { mapDbTemplate, mapTemplateToInsert } from "@/lib/mappers";
import type { Template } from "@/types/template";

const EMPTY_TEMPLATES: Template[] = [];

export function useTemplates(projectId: string | undefined) {
  const isGuest = useAuthStore((s) => s.isGuest);
  const guestTemplates = useGuestStore(
    useShallow((s) => s.templates.filter((t) => t.projectId === projectId))
  );

  const query = useQuery({
    queryKey: ["templates", projectId],
    queryFn: async () => {
      const rows = await svc.fetchTemplates(projectId!);
      return rows.map(mapDbTemplate);
    },
    enabled: !isGuest && !!projectId,
  });

  return {
    templates: isGuest ? guestTemplates : (query.data ?? EMPTY_TEMPLATES),
    isLoading: isGuest ? false : query.isLoading,
  };
}

export function useTemplate(id: string | undefined) {
  const isGuest = useAuthStore((s) => s.isGuest);
  const guestTemplate = useGuestStore((s) =>
    s.templates.find((t) => t.id === id)
  );

  const query = useQuery({
    queryKey: ["templates", "detail", id],
    queryFn: async () => {
      const row = await svc.fetchTemplate(id!);
      return mapDbTemplate(row);
    },
    enabled: !isGuest && !!id,
  });

  return {
    template: isGuest ? (guestTemplate ?? null) : (query.data ?? null),
    isLoading: isGuest ? false : query.isLoading,
  };
}

export function useCreateTemplate() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const addTemplate = useGuestStore((s) => s.addTemplate);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (template: Template) => {
      if (isGuest) {
        addTemplate(template);
        return template;
      }
      const row = await svc.createTemplate(mapTemplateToInsert(template));
      return mapDbTemplate(row);
    },
    onSuccess: (_data, template) => {
      if (!isGuest) {
        qc.invalidateQueries({ queryKey: ["templates", template.projectId] });
      }
      toast.success("Template created");
    },
    onError: (err) => {
      toast.error(`Failed to create template: ${err.message}`);
    },
  });
}

export function useUpdateTemplate() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const updateTemplate = useGuestStore((s) => s.updateTemplate);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (template: Template) => {
      if (isGuest) {
        updateTemplate(template.id, template);
        return;
      }
      const insert = mapTemplateToInsert(template);
      await svc.updateTemplate(template.id, insert);
    },
    onSuccess: (_data, template) => {
      if (!isGuest) {
        qc.invalidateQueries({ queryKey: ["templates", template.projectId] });
        qc.invalidateQueries({ queryKey: ["templates", "detail", template.id] });
      }
      toast.success("Template saved");
    },
    onError: (err) => {
      toast.error(`Failed to save template: ${err.message}`);
    },
  });
}

export function useDeleteTemplate() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const deleteTemplate = useGuestStore((s) => s.deleteTemplate);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; projectId: string }) => {
      if (isGuest) {
        deleteTemplate(args.id);
        return;
      }
      await svc.deleteTemplate(args.id);
    },
    onSuccess: (_data, { projectId }) => {
      if (!isGuest) {
        qc.invalidateQueries({ queryKey: ["templates", projectId] });
      }
      toast.success("Template deleted");
    },
    onError: (err) => {
      toast.error(`Failed to delete template: ${err.message}`);
    },
  });
}
