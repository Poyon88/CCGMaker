import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export interface RulesItem {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  sortOrder: number;
}

interface RulesListEditorProps<T extends RulesItem> {
  items: T[];
  typeLabel: string;
  projectId: string;
  showDescription?: boolean;
  onUpdate: (items: T[]) => void;
  createItem: (base: RulesItem) => T;
  renderExtra?: (item: T, onChange: (updated: T) => void) => React.ReactNode;
}

export function RulesListEditor<T extends RulesItem>({
  items,
  typeLabel,
  projectId,
  showDescription = true,
  onUpdate,
  createItem,
  renderExtra,
}: RulesListEditorProps<T>) {
  const { t } = useTranslation("project");
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

  const handleAdd = () => {
    const newItem = createItem({
      id: crypto.randomUUID(),
      projectId,
      name: "",
      description: "",
      sortOrder: items.length,
    });
    onUpdate([...items, newItem]);
  };

  const handleChange = (id: string, updated: Partial<T>) => {
    onUpdate(items.map((item) => (item.id === id ? { ...item, ...updated } : item)));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const remaining = items.filter((item) => item.id !== deleteTarget.id);
    // Re-index sortOrder
    const reindexed = remaining.map((item, i) => ({ ...item, sortOrder: i }));
    onUpdate(reindexed);
    setDeleteTarget(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sorted];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onUpdate(updated.map((item, i) => ({ ...item, sortOrder: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === sorted.length - 1) return;
    const updated = [...sorted];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onUpdate(updated.map((item, i) => ({ ...item, sortOrder: i })));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {sorted.length === 0 && t("rules.empty", { type: typeLabel.toLowerCase() })}
        </span>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="mr-1 h-3 w-3" />
          {t("rules.add")}
        </Button>
      </div>

      {sorted.map((item, index) => (
        <div
          key={item.id}
          className="flex items-start gap-2 rounded-lg border bg-card p-3"
        >
          <div className="flex flex-col items-center gap-0.5 pt-2 text-muted-foreground">
            <GripVertical className="h-4 w-4" />
            <button
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
              className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleMoveDown(index)}
              disabled={index === sorted.length - 1}
              className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <Input
              placeholder={t("rules.name_placeholder")}
              value={item.name}
              onChange={(e) => handleChange(item.id, { name: e.target.value } as Partial<T>)}
            />
            {showDescription && (
              <Textarea
                placeholder={t("rules.description_placeholder")}
                value={item.description ?? ""}
                rows={2}
                onChange={(e) =>
                  handleChange(item.id, { description: e.target.value } as Partial<T>)
                }
              />
            )}
            {renderExtra?.(item, (updated) => handleChange(item.id, updated as Partial<T>))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="mt-1 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteTarget(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("rules.delete_title", { name: deleteTarget?.name || "" })}
        description={t("rules.delete_message", { name: deleteTarget?.name || "" })}
        onConfirm={handleDelete}
      />
    </div>
  );
}
