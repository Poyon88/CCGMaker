import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layers, Plus, MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { CardRenderer } from "@/components/card/card-renderer";
import { useCards, useCreateCard, useDeleteCard } from "@/hooks/use-cards";
import { useTemplates } from "@/hooks/use-templates";
import type { Card } from "@/types/card";

export default function CardListPage() {
  const { projectId } = useParams();
  const { t } = useTranslation(["card", "common"]);
  const { cards, isLoading } = useCards(projectId);
  const { templates } = useTemplates(projectId);
  const createCard = useCreateCard();
  const deleteCardMut = useDeleteCard();

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null);

  const filtered = cards.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTemplate = (templateId: string | null) =>
    templates.find((tpl) => tpl.id === templateId);

  const handleDuplicate = (card: Card) => {
    const now = new Date().toISOString();
    createCard.mutate({
      ...card,
      id: crypto.randomUUID(),
      name: `${card.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteCardMut.mutate({ id: deleteTarget.id, projectId });
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (cards.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title={t("card:list.empty.title")}
        description={t("card:list.empty.description")}
        actionLabel={t("card:list.empty.cta")}
        actionHref={`/projects/${projectId}/cards/new`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder={t("card:list.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          aria-label={t("card:list.search")}
        />
        <div className="flex-1" />
        <Link to={`/projects/${projectId}/cards/new`}>
          <Button size="sm">
            <Plus className="mr-1 h-3 w-3" />
            {t("card:editor.new")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((card) => {
          const tpl = getTemplate(card.templateId);
          return (
            <div key={card.id} className="group rounded-lg border bg-card p-3">
              {/* Thumbnail */}
              <Link to={`/projects/${projectId}/cards/${card.id}`}>
                <div className="mb-3 flex justify-center rounded bg-muted/30 p-2">
                  {tpl ? (
                    <CardRenderer
                      definition={tpl.definition}
                      fieldValues={card.fieldValues}
                      scale={0.35}
                    />
                  ) : (
                    <div className="flex h-[184px] w-[131px] items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                      No template
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex items-start justify-between">
                <Link to={`/projects/${projectId}/cards/${card.id}`} className="flex-1">
                  <h3 className="font-medium hover:underline">{card.name || "Untitled"}</h3>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${card.name || "Untitled"}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/projects/${projectId}/cards/${card.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("common:actions.edit")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(card)}>
                      <Copy className="mr-2 h-4 w-4" />
                      {t("common:actions.duplicate")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(card)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("common:actions.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("card:delete.title")}
        description={t("card:delete.message")}
        confirmLabel={t("card:delete.confirm")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
