import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { TemplateField } from "@/types/template";

interface CardEditorFormProps {
  fields: TemplateField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export function CardEditorForm({ fields, values, onChange }: CardEditorFormProps) {
  const { t } = useTranslation("project");

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <Label className="text-xs">
            {field.label}{" "}
            <span className="text-muted-foreground">
              ({t(`template.field_types.${field.type}`)})
            </span>
          </Label>
          {field.type === "description" ? (
            <Textarea
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              rows={3}
            />
          ) : field.type === "illustration" ? (
            <Input
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder="Image URL..."
            />
          ) : (
            <Input
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
