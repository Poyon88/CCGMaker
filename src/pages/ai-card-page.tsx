import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Wand2, ArrowLeft, ArrowRight, RotateCcw, Save, ImagePlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardRenderer } from "@/components/card/card-renderer";
import { useTemplates } from "@/hooks/use-templates";
import { useCreateCard } from "@/hooks/use-cards";
import { useAuthStore } from "@/stores/auth-store";
import { generateCard, generateImage } from "@/services/ai.service";
import type { Card } from "@/types/card";

const STEPS = [
  "step_project",
  "step_type",
  "step_universe",
  "step_power",
  "step_role",
  "step_custom",
] as const;

export default function AICardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["card", "common"]);
  const isGuest = useAuthStore((s) => s.isGuest);
  const { templates } = useTemplates(projectId);
  const createCard = useCreateCard();

  const projectTemplates = templates;

  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState({
    templateId: projectTemplates[0]?.id ?? "",
    cardType: "",
    universe: "",
    powerLevel: "medium",
    role: "",
    customRequest: "",
  });

  const [result, setResult] = useState<Card | null>(null);

  const selectedTemplate = templates.find((tpl) => tpl.id === answers.templateId);

  // Mock generation for guest mode
  const generateMock = () => {
    const fields = selectedTemplate?.definition.fields ?? [];
    const fieldValues: Record<string, string> = {};
    for (const field of fields) {
      switch (field.type) {
        case "name":
          fieldValues[field.id] = `${answers.universe || "Epic"} ${answers.role || "Warrior"}`;
          break;
        case "description":
          fieldValues[field.id] = `A ${answers.powerLevel} ${answers.cardType || "creature"} from the ${answers.universe || "fantasy"} realm. ${answers.customRequest || ""}`.trim();
          break;
        case "type":
          fieldValues[field.id] = answers.cardType || "Creature";
          break;
        case "stat":
          fieldValues[field.id] = answers.powerLevel === "high" ? "15" : answers.powerLevel === "low" ? "5" : "10";
          break;
        case "rarity":
          fieldValues[field.id] = answers.powerLevel === "high" ? "Legendary" : answers.powerLevel === "low" ? "Common" : "Rare";
          break;
        case "tribe":
          fieldValues[field.id] = answers.universe || "Unknown";
          break;
        case "power":
          fieldValues[field.id] = answers.role || "Strike";
          break;
        default:
          fieldValues[field.id] = "";
      }
    }
    const nameField = fields.find((f) => f.type === "name");
    const cardName = nameField ? fieldValues[nameField.id] : "AI Card";
    return { fieldValues, cardName };
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      let fieldValues: Record<string, string>;
      let cardName: string;

      if (isGuest) {
        // Mock for guests (with small delay for UX)
        await new Promise((r) => setTimeout(r, 1500));
        const mock = generateMock();
        fieldValues = mock.fieldValues;
        cardName = mock.cardName;
      } else {
        // Real AI for authenticated users
        const fields = (selectedTemplate?.definition.fields ?? []).map((f) => ({
          id: f.id,
          type: f.type,
          label: f.label,
        }));

        const result = await generateCard({
          cardType: answers.cardType,
          universe: answers.universe,
          powerLevel: answers.powerLevel,
          role: answers.role,
          customRequest: answers.customRequest,
          fields,
        });
        fieldValues = result.fieldValues;
        cardName = result.cardName;
      }

      const now = new Date().toISOString();
      setResult({
        id: crypto.randomUUID(),
        projectId: projectId ?? null,
        templateId: answers.templateId,
        userId: isGuest ? "guest" : "pending",
        name: cardName || "AI Card",
        fieldValues,
        illustrationUrl: null,
        cardTypeId: null,
        rarityId: null,
        tribeId: null,
        powerIds: [],
        thumbnailUrl: null,
        isAiGenerated: true,
        createdAt: now,
        updatedAt: now,
      });
      setGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!result || isGuest) return;
    setGeneratingImage(true);
    setError(null);

    try {
      const descField = selectedTemplate?.definition.fields.find((f) => f.type === "description");
      const description = descField ? (result.fieldValues[descField.id] ?? "") : "";

      const { imageUrl } = await generateImage({
        cardName: result.name,
        cardType: answers.cardType || "creature",
        universe: answers.universe || "fantasy",
        description,
        cardId: result.id,
      });

      setResult((prev) => prev ? { ...prev, illustrationUrl: imageUrl } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSave = () => {
    if (result) {
      createCard.mutate(result);
      navigate(`/projects/${projectId}/cards/${result.id}`);
    }
  };

  const handleRegenerate = () => {
    setGenerated(false);
    setResult(null);
    setError(null);
    handleGenerate();
  };

  // Step progress bar
  const totalSteps = STEPS.length;
  const progressPercent = generated ? 100 : ((step + 1) / totalSteps) * 100;

  // Render result view
  if (generated && result) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">{t("card:ai.title")}</h2>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
          <div className="rounded-lg border bg-muted/30 p-8">
            {selectedTemplate && (
              <CardRenderer
                definition={selectedTemplate.definition}
                fieldValues={result.fieldValues}
              />
            )}
          </div>
          <div className="space-y-3">
            <h3 className="font-medium">{result.name}</h3>
            {result.illustrationUrl && (
              <p className="text-xs text-muted-foreground">
                Illustration generated
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-1 h-4 w-4" />
                {t("card:ai.save")}
              </Button>
              <Button variant="outline" onClick={handleRegenerate}>
                <RotateCcw className="mr-1 h-4 w-4" />
                {t("card:ai.regenerate")}
              </Button>
              {!isGuest && (
                <Button
                  variant="outline"
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                >
                  <ImagePlus className="mr-1 h-4 w-4" />
                  {generatingImage ? t("card:ai.generating_image") : t("card:ai.generate_image")}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  createCard.mutate(result);
                  navigate(`/projects/${projectId}/cards/${result.id}/edit`);
                }}
              >
                {t("card:ai.edit_result")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render generating state
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Wand2 className="h-12 w-12 animate-pulse text-primary" />
        <p className="text-lg font-medium">{t("card:ai.generating")}</p>
        {!isGuest && (
          <p className="text-sm text-muted-foreground">{t("card:ai.generating_ai")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h2 className="text-lg font-semibold">{t("card:ai.title")}</h2>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {t(`card:ai.${STEPS[step]}`)} ({step + 1}/{totalSteps})
      </p>

      {/* Step content */}
      <div className="space-y-4">
        {step === 0 && (
          <div className="space-y-2">
            <Label>{t("card:editor.select_template")}</Label>
            <Select
              value={answers.templateId}
              onValueChange={(v) => setAnswers((a) => ({ ...a, templateId: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectTemplates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.id}>
                    {tpl.name || "Untitled"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            <Label>{t("card:ai.step_type")}</Label>
            <Input
              value={answers.cardType}
              onChange={(e) => setAnswers((a) => ({ ...a, cardType: e.target.value }))}
              placeholder="Creature, Spell, Equipment..."
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <Label>{t("card:ai.step_universe")}</Label>
            <Input
              value={answers.universe}
              onChange={(e) => setAnswers((a) => ({ ...a, universe: e.target.value }))}
              placeholder="Fantasy, Sci-Fi, Steampunk..."
            />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-2">
            <Label>{t("card:ai.step_power")}</Label>
            <Select
              value={answers.powerLevel}
              onValueChange={(v) => setAnswers((a) => ({ ...a, powerLevel: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-2">
            <Label>{t("card:ai.step_role")}</Label>
            <Input
              value={answers.role}
              onChange={(e) => setAnswers((a) => ({ ...a, role: e.target.value }))}
              placeholder="Tank, DPS, Healer..."
            />
          </div>
        )}
        {step === 5 && (
          <div className="space-y-2">
            <Label>{t("card:ai.step_custom")}</Label>
            <Textarea
              value={answers.customRequest}
              onChange={(e) => setAnswers((a) => ({ ...a, customRequest: e.target.value }))}
              rows={4}
              placeholder="Any special requests..."
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t("common:actions.back")}
        </Button>
        {step < totalSteps - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            <ArrowRight className="mr-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={!answers.templateId}>
            <Wand2 className="mr-1 h-4 w-4" />
            {t("card:ai.generate")}
          </Button>
        )}
      </div>
    </div>
  );
}
