import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Plus, Wand2 } from "lucide-react";

interface QuickActionsProps {
  onNewProject: () => void;
  onNewCard?: () => void;
}

export function QuickActions({ onNewProject, onNewCard }: QuickActionsProps) {
  const { t } = useTranslation("dashboard");

  return (
    <div className="flex gap-3">
      <Button onClick={onNewProject}>
        <Plus className="mr-2 h-4 w-4" />
        {t("new_project")}
      </Button>
      {onNewCard && (
        <Button variant="outline" onClick={onNewCard}>
          <Wand2 className="mr-2 h-4 w-4" />
          {t("new_card")}
        </Button>
      )}
    </div>
  );
}
