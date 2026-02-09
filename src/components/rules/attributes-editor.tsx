import { useTranslation } from "react-i18next";
import { RulesListEditor, type RulesItem } from "./rules-list-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Attribute } from "@/types/project";

interface AttributesEditorProps {
  items: Attribute[];
  projectId: string;
  onUpdate: (items: Attribute[]) => void;
}

export function AttributesEditor({ items, projectId, onUpdate }: AttributesEditorProps) {
  const { t } = useTranslation("project");

  return (
    <RulesListEditor<Attribute>
      items={items}
      typeLabel={t("rules.attributes")}
      projectId={projectId}
      showDescription={false}
      onUpdate={onUpdate}
      createItem={(base: RulesItem) => ({
        id: base.id,
        projectId: base.projectId,
        name: base.name,
        sortOrder: base.sortOrder,
        valueType: "number",
        defaultValue: "0",
        minValue: null,
        maxValue: null,
      })}
      renderExtra={(item, onChange) => (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">{t("rules.value_type")}</Label>
            <Select
              value={item.valueType}
              onValueChange={(v) =>
                onChange({ ...item, valueType: v as Attribute["valueType"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">{t("rules.number")}</SelectItem>
                <SelectItem value="text">{t("rules.text")}</SelectItem>
                <SelectItem value="boolean">{t("rules.boolean")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("rules.default_value")}</Label>
            <Input
              value={item.defaultValue}
              onChange={(e) => onChange({ ...item, defaultValue: e.target.value })}
            />
          </div>
          {item.valueType === "number" && (
            <>
              <div className="space-y-1">
                <Label className="text-xs">{t("rules.min_value")}</Label>
                <Input
                  type="number"
                  value={item.minValue ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...item,
                      minValue: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("rules.max_value")}</Label>
                <Input
                  type="number"
                  value={item.maxValue ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...item,
                      maxValue: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
      )}
    />
  );
}
