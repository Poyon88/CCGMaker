import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fileToDataUrl, resizeImageToDataUrl } from "@/lib/image-utils";

import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardRenderer } from "@/components/card/card-renderer";
import { CardEditorForm } from "@/components/card/card-editor-form";
import { useCard, useCreateCard, useUpdateCard } from "@/hooks/use-cards";
import { useTemplates } from "@/hooks/use-templates";
import { useAuthStore } from "@/stores/auth-store";
import type { Card } from "@/types/card";

export default function CardEditorPage() {
  const { projectId, cardId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "common"]);
  const isGuest = useAuthStore((s) => s.isGuest);

  const { templates } = useTemplates(projectId);
  const { card: existing, isLoading } = useCard(cardId);
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();

  const projectTemplates = templates;
  const isNew = !cardId;

  const [localCard, setLocalCard] = useState<Card>(() => {
    if (existing) return existing;
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      projectId: projectId ?? null,
      templateId: projectTemplates[0]?.id ?? null,
      userId: isGuest ? "guest" : "pending",
      name: "",
      fieldValues: {},
      illustrationUrl: null,
      cardTypeId: null,
      rarityId: null,
      tribeId: null,
      powerIds: [],
      thumbnailUrl: null,
      isAiGenerated: false,
      createdAt: now,
      updatedAt: now,
    };
  });

  useEffect(() => {
    if (existing) setLocalCard(existing);
  }, [existing]);

  const selectedTemplate = useMemo(
    () => templates.find((tpl) => tpl.id === localCard.templateId),
    [templates, localCard.templateId]
  );

  const illustrationInputRef = useRef<HTMLInputElement>(null);
  const illustrationFieldIdRef = useRef<string | null>(null);

  const handleFieldChange = (fieldId: string, value: string) => {
    setLocalCard((prev) => ({
      ...prev,
      fieldValues: { ...prev.fieldValues, [fieldId]: value },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleIllustrationClick = (fieldId: string) => {
    illustrationFieldIdRef.current = fieldId;
    illustrationInputRef.current?.click();
  };

  const handleIllustrationFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fieldId = illustrationFieldIdRef.current;
    if (!file || !fieldId) return;
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    const resized = await resizeImageToDataUrl(dataUrl, 750, 1050);
    handleFieldChange(fieldId, resized);
    e.target.value = "";
  };

  const handleSave = () => {
    const updated = { ...localCard, name: localCard.name || "Untitled Card" };
    if (isNew) {
      createCard.mutate(updated);
    } else {
      updateCard.mutate(updated);
    }
    navigate(`/projects/${projectId}/cards`);
  };

  if (!isNew && isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/projects/${projectId}/cards`)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("common:actions.back")}
        </Button>
        <h2 className="flex-1 text-lg font-semibold">
          {isNew ? t("card:editor.new") : t("card:editor.title")}
        </h2>
        <Button onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" />
          {t("common:actions.save")}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Left: form */}
        <div className="w-80 shrink-0 space-y-4 overflow-y-auto">
          {/* Template selector */}
          <div className="space-y-1">
            <Label className="text-xs">{t("card:editor.select_template")}</Label>
            <Select
              value={localCard.templateId ?? ""}
              onValueChange={(v) =>
                setLocalCard((prev) => ({ ...prev, templateId: v, updatedAt: new Date().toISOString() }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("card:editor.select_template")} />
              </SelectTrigger>
              <SelectContent>
                {projectTemplates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    {tpl.name || "Untitled Template"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Card name */}
          <div className="space-y-1">
            <Label className="text-xs">{t("card:editor.name")}</Label>
            <Input
              value={localCard.name}
              onChange={(e) =>
                setLocalCard((prev) => ({
                  ...prev,
                  name: e.target.value,
                  updatedAt: new Date().toISOString(),
                }))
              }
            />
          </div>

          {/* Dynamic form fields */}
          {selectedTemplate && (
            <CardEditorForm
              fields={selectedTemplate.definition.fields}
              values={localCard.fieldValues}
              onChange={handleFieldChange}
            />
          )}
        </div>

        {/* Right: preview */}
        <div className="flex flex-1 items-start justify-center rounded-lg border bg-muted/30 p-8">
          <input
            ref={illustrationInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleIllustrationFile}
            className="hidden"
          />
          {selectedTemplate ? (
            <CardRenderer
              definition={selectedTemplate.definition}
              fieldValues={localCard.fieldValues}
              onIllustrationClick={handleIllustrationClick}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("card:editor.select_template")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
