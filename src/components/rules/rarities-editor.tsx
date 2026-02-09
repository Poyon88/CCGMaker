import { useTranslation } from "react-i18next";
import { RulesListEditor, type RulesItem } from "./rules-list-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Rarity } from "@/types/project";

interface RaritiesEditorProps {
  items: Rarity[];
  projectId: string;
  onUpdate: (items: Rarity[]) => void;
}

export function RaritiesEditor({ items, projectId, onUpdate }: RaritiesEditorProps) {
  const { t } = useTranslation("project");

  return (
    <RulesListEditor<Rarity>
      items={items}
      typeLabel={t("rules.rarities")}
      projectId={projectId}
      showDescription={false}
      onUpdate={onUpdate}
      createItem={(base: RulesItem) => ({
        id: base.id,
        projectId: base.projectId,
        name: base.name,
        sortOrder: base.sortOrder,
        color: "#6b7280",
        iconUrl: null,
      })}
      renderExtra={(item, onChange) => (
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label className="text-xs">{t("rules.color")}</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={item.color}
                onChange={(e) => onChange({ ...item, color: e.target.value })}
                className="h-9 w-9 cursor-pointer rounded border"
              />
              <Input
                value={item.color}
                onChange={(e) => onChange({ ...item, color: e.target.value })}
                className="w-28"
              />
            </div>
          </div>
        </div>
      )}
    />
  );
}
