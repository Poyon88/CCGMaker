import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Pencil, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { CardRenderer } from "@/components/card/card-renderer";
import { useCard, useCreateCard, useDeleteCard } from "@/hooks/use-cards";
import { useTemplates } from "@/hooks/use-templates";

export default function CardDetailPage() {
  const { projectId, cardId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "common"]);
  const { card, isLoading } = useCard(cardId);
  const { templates } = useTemplates(projectId);
  const createCard = useCreateCard();
  const deleteCardMut = useDeleteCard();

  const template = card ? templates.find((tpl) => tpl.id === card.templateId) : null;
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (!card) {
    return (
      <div className="py-12 text-center text-muted-foreground">Card not found.</div>
    );
  }

  const handleDuplicate = () => {
    const now = new Date().toISOString();
    const newCard = {
      ...card,
      id: crypto.randomUUID(),
      name: `${card.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    };
    createCard.mutate(newCard);
    navigate(`/projects/${projectId}/cards/${newCard.id}`);
  };

  const handleDelete = () => {
    deleteCardMut.mutate({ id: card.id, projectId });
    navigate(`/projects/${projectId}/cards`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}/cards`)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("common:actions.back")}
        </Button>
        <h2 className="flex-1 text-lg font-semibold">{card.name || "Untitled"}</h2>
        {card.isAiGenerated && (
          <Badge variant="secondary">{t("card:detail.ai_generated")}</Badge>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
        {/* Card preview */}
        <div className="rounded-lg border bg-muted/30 p-8">
          {template ? (
            <CardRenderer
              definition={template.definition}
              fieldValues={card.fieldValues}
            />
          ) : (
            <div className="flex h-[525px] w-[375px] items-center justify-center rounded bg-muted text-muted-foreground">
              No template
            </div>
          )}
        </div>

        {/* Actions & info */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Link to={`/projects/${projectId}/cards/${card.id}/edit`}>
              <Button size="sm">
                <Pencil className="mr-1 h-3 w-3" />
                {t("card:detail.edit")}
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="mr-1 h-3 w-3" />
              {t("card:detail.duplicate")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {t("card:detail.delete")}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Created: {new Date(card.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(card.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title={t("card:delete.title")}
        description={t("card:delete.message")}
        confirmLabel={t("card:delete.confirm")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
