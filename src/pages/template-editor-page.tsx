import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { TemplateEditor } from "@/components/template/template-editor";
import { useTemplate, useCreateTemplate, useUpdateTemplate } from "@/hooks/use-templates";
import { createDefaultDefinition } from "@/lib/default-template";
import type { Template } from "@/types/template";

export default function TemplateEditorPage() {
  const { projectId, templateId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["project", "common"]);

  const isNew = !templateId;
  const { template: existing, isLoading } = useTemplate(templateId);
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [localTemplate, setLocalTemplate] = useState<Template>(() => {
    if (existing) return existing;
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      projectId: projectId ?? "",
      name: "",
      description: "",
      definition: createDefaultDefinition(),
      style: { primaryColor: "#3b82f6", secondaryColor: "#1f2937", fontFamily: "sans-serif" },
      thumbnailUrl: null,
      createdAt: now,
      updatedAt: now,
    };
  });

  // Sync from store/query if editing an existing template
  useEffect(() => {
    if (existing) setLocalTemplate(existing);
  }, [existing]);

  const handleSave = () => {
    if (isNew) {
      createTemplate.mutate(localTemplate);
    } else {
      updateTemplate.mutate(localTemplate);
    }
    navigate(`/projects/${projectId}/templates`);
  };

  if (!isNew && isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}/templates`)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("common:actions.back")}
        </Button>
        <h2 className="flex-1 text-lg font-semibold">
          {isNew ? t("project:template.new") : t("project:template.editor_title")}
        </h2>
        <Button onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" />
          {t("common:actions.save")}
        </Button>
      </div>
      <TemplateEditor template={localTemplate} onChange={setLocalTemplate} />
    </div>
  );
}
