import { useTranslation } from "react-i18next";
import { RulesListEditor, type RulesItem } from "./rules-list-editor";
import type { Power } from "@/types/project";

interface PowersEditorProps {
  items: Power[];
  projectId: string;
  onUpdate: (items: Power[]) => void;
}

export function PowersEditor({ items, projectId, onUpdate }: PowersEditorProps) {
  const { t } = useTranslation("project");

  return (
    <RulesListEditor<Power>
      items={items}
      typeLabel={t("rules.powers")}
      projectId={projectId}
      onUpdate={onUpdate}
      createItem={(base: RulesItem) => ({
        ...base,
        description: base.description ?? "",
      })}
    />
  );
}
