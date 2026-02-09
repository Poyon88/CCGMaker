import { useTranslation } from "react-i18next";
import { RulesListEditor, type RulesItem } from "./rules-list-editor";
import type { CardType } from "@/types/project";

interface CardTypesEditorProps {
  items: CardType[];
  projectId: string;
  onUpdate: (items: CardType[]) => void;
}

export function CardTypesEditor({ items, projectId, onUpdate }: CardTypesEditorProps) {
  const { t } = useTranslation("project");

  return (
    <RulesListEditor<CardType>
      items={items}
      typeLabel={t("rules.card_types")}
      projectId={projectId}
      onUpdate={onUpdate}
      createItem={(base: RulesItem) => ({
        ...base,
        description: base.description ?? "",
      })}
    />
  );
}
