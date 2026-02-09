import { useTranslation } from "react-i18next";
import { RulesListEditor, type RulesItem } from "./rules-list-editor";
import type { Tribe } from "@/types/project";

interface TribesEditorProps {
  items: Tribe[];
  projectId: string;
  onUpdate: (items: Tribe[]) => void;
}

export function TribesEditor({ items, projectId, onUpdate }: TribesEditorProps) {
  const { t } = useTranslation("project");

  return (
    <RulesListEditor<Tribe>
      items={items}
      typeLabel={t("rules.tribes")}
      projectId={projectId}
      onUpdate={onUpdate}
      createItem={(base: RulesItem) => ({
        ...base,
        description: base.description ?? "",
      })}
    />
  );
}
