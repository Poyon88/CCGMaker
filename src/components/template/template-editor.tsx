import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CardRenderer } from "@/components/card/card-renderer";
import { TemplateFieldList } from "./template-field-list";
import { TemplateFieldConfig } from "./template-field-config";
import { TemplateGlobalConfig } from "./template-global-config";
import { useAuthStore } from "@/stores/auth-store";
import type { Template, TemplateField, TemplateDefinition } from "@/types/template";

interface TemplateEditorProps {
  template: Template;
  onChange: (updated: Template) => void;
}

export function TemplateEditor({ template, onChange }: TemplateEditorProps) {
  const { t } = useTranslation("project");
  const isGuest = useAuthStore((s) => s.isGuest);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const definition = template.definition;
  const selectedField = definition.fields.find((f) => f.id === selectedFieldId) ?? null;

  const updateDefinition = (updated: TemplateDefinition) => {
    onChange({ ...template, definition: updated, updatedAt: new Date().toISOString() });
  };

  const updateFields = (fields: TemplateField[]) => {
    updateDefinition({ ...definition, fields });
  };

  const updateField = (updated: TemplateField) => {
    updateFields(definition.fields.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleFieldMove = (fieldId: string, x: number, y: number) => {
    const field = definition.fields.find((f) => f.id === fieldId);
    if (field) updateField({ ...field, x: Math.round(x), y: Math.round(y) });
  };

  const handleFieldResize = (fieldId: string, w: number, h: number, x: number, y: number) => {
    const field = definition.fields.find((f) => f.id === fieldId);
    if (field) updateField({ ...field, width: Math.round(w), height: Math.round(h), x: Math.round(x), y: Math.round(y) });
  };

  return (
    <div className="flex gap-6">
      {/* Left panel - Settings */}
      <div className="w-80 shrink-0 space-y-4 overflow-y-auto">
        {/* Template name & description */}
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-xs">{t("template.name")}</Label>
            <Input
              value={template.name}
              onChange={(e) =>
                onChange({ ...template, name: e.target.value, updatedAt: new Date().toISOString() })
              }
              placeholder={t("template.name_placeholder")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("template.description")}</Label>
            <Textarea
              value={template.description}
              onChange={(e) =>
                onChange({
                  ...template,
                  description: e.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              placeholder={t("template.description_placeholder")}
              rows={2}
            />
          </div>
        </div>

        <Separator />

        {/* Global card settings */}
        <TemplateGlobalConfig definition={definition} onChange={updateDefinition} templateId={template.id} isGuest={isGuest} />

        <Separator />

        {/* Fields list */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">{t("template.fields")}</h3>
          <TemplateFieldList
            fields={definition.fields}
            selectedFieldId={selectedFieldId}
            onSelect={setSelectedFieldId}
            onUpdate={updateFields}
          />
        </div>

        <Separator />

        {/* Selected field config */}
        {selectedField ? (
          <TemplateFieldConfig field={selectedField} onChange={updateField} />
        ) : (
          <p className="text-sm text-muted-foreground">{t("template.no_field_selected")}</p>
        )}
      </div>

      {/* Right panel - Card Preview */}
      <div className="flex flex-1 items-start justify-center rounded-lg border bg-muted/30 p-8">
        <CardRenderer
          definition={definition}
          selectedFieldId={selectedFieldId}
          onFieldClick={setSelectedFieldId}
          onFieldMove={handleFieldMove}
          onFieldResize={handleFieldResize}
        />
      </div>
    </div>
  );
}
