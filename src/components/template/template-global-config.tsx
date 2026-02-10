import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BackgroundImageUploader } from "./background-image-uploader";
import type { TemplateDefinition } from "@/types/template";

interface TemplateGlobalConfigProps {
  definition: TemplateDefinition;
  onChange: (updated: TemplateDefinition) => void;
  templateId: string;
  isGuest: boolean;
}

export function TemplateGlobalConfig({ definition, onChange, templateId, isGuest }: TemplateGlobalConfigProps) {
  const { t } = useTranslation("project");

  const update = (patch: Partial<TemplateDefinition>) =>
    onChange({ ...definition, ...patch });

  const hasBackgroundImage = !!definition.backgroundImage;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{t("template.global")}</h3>

      <BackgroundImageUploader
        backgroundImage={definition.backgroundImage}
        backgroundImageFit={definition.backgroundImageFit}
        templateId={templateId}
        isGuest={isGuest}
        onChange={update}
      />

      {!hasBackgroundImage && (
        <>
          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("template.settings.background_color")}</Label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={definition.backgroundColor}
                  onChange={(e) => update({ backgroundColor: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded border"
                />
                <Input
                  value={definition.backgroundColor}
                  onChange={(e) => update({ backgroundColor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("template.settings.border_color")}</Label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={definition.borderColor}
                  onChange={(e) => update({ borderColor: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded border"
                />
                <Input
                  value={definition.borderColor}
                  onChange={(e) => update({ borderColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("template.settings.border_width")}</Label>
              <Input
                type="number"
                min={0}
                value={definition.borderWidth}
                onChange={(e) => update({ borderWidth: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("template.settings.border_radius")}</Label>
              <Input
                type="number"
                min={0}
                value={definition.borderRadius}
                onChange={(e) => update({ borderRadius: Number(e.target.value) })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
