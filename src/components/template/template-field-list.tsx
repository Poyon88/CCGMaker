import { useTranslation } from "react-i18next";

import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { TemplateField } from "@/types/template";
import { useState } from "react";

const FIELD_TYPES: TemplateField["type"][] = [
  "name",
  "illustration",
  "description",
  "stat",
  "type",
  "rarity",
  "power",
  "tribe",
  "custom_text",
];

interface TemplateFieldListProps {
  fields: TemplateField[];
  selectedFieldId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (fields: TemplateField[]) => void;
}

export function TemplateFieldList({
  fields,
  selectedFieldId,
  onSelect,
  onUpdate,
}: TemplateFieldListProps) {
  const { t } = useTranslation("project");
  const [addType, setAddType] = useState<TemplateField["type"]>("custom_text");

  const handleAdd = () => {
    const newField: TemplateField = {
      id: crypto.randomUUID(),
      type: addType,
      label: t(`template.field_types.${addType}`),
      x: 10,
      y: 10,
      width: 80,
      height: 8,
      fontSize: 14,
      fontFamily: "sans-serif",
      fontWeight: "normal",
      fontColor: "#1f2937",
      textAlign: "center",
      backgroundColor: "",
      borderRadius: 0,
      visible: true,
    };
    onUpdate([...fields, newField]);
    onSelect(newField.id);
  };

  const handleDelete = (id: string) => {
    onUpdate(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) onSelect(null);
  };

  const toggleVisibility = (id: string) => {
    onUpdate(fields.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={addType} onValueChange={(v) => setAddType(v as TemplateField["type"])}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((ft) => (
              <SelectItem key={ft} value={ft}>
                {t(`template.field_types.${ft}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-1 h-3 w-3" />
          {t("template.add_field")}
        </Button>
      </div>

      <div className="space-y-1">
        {fields.map((field) => (
          <div
            key={field.id}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
              selectedFieldId === field.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted"
            )}
            onClick={() => onSelect(field.id)}
          >
            <span className="flex-1 truncate">
              {field.label}{" "}
              <span className="text-xs text-muted-foreground">
                ({t(`template.field_types.${field.type}`)})
              </span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(field.id);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              {field.visible ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(field.id);
              }}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
