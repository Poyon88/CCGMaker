import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemplateField } from "@/types/template";

interface TemplateFieldConfigProps {
  field: TemplateField;
  onChange: (updated: TemplateField) => void;
}

export function TemplateFieldConfig({ field, onChange }: TemplateFieldConfigProps) {
  const { t } = useTranslation("project");

  const update = (patch: Partial<TemplateField>) => onChange({ ...field, ...patch });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{t("template.field_properties")}</h3>

      {/* Label */}
      <div className="space-y-1">
        <Label className="text-xs">Label</Label>
        <Input value={field.label} onChange={(e) => update({ label: e.target.value })} />
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t("template.settings.position_x")}</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={field.x}
            onChange={(e) => update({ x: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("template.settings.position_y")}</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={field.y}
            onChange={(e) => update({ y: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t("template.settings.width")}</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={field.width}
            onChange={(e) => update({ width: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t("template.settings.height")}</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={field.height}
            onChange={(e) => update({ height: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* Illustration: oval clip shape */}
      {field.type === "illustration" && (
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t("template.settings.oval_shape")}</Label>
          <Switch
            checked={field.clipShape === "ellipse"}
            onCheckedChange={(checked) =>
              update({ clipShape: checked ? "ellipse" : "rectangle" })
            }
          />
        </div>
      )}

      {/* Font */}
      {field.type !== "illustration" && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("template.settings.font_size")}</Label>
              <Input
                type="number"
                min={6}
                max={72}
                value={field.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("template.settings.font_weight")}</Label>
              <Select value={field.fontWeight} onValueChange={(v) => update({ fontWeight: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                  <SelectItem value="lighter">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("template.settings.font_color")}</Label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={field.fontColor}
                  onChange={(e) => update({ fontColor: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded border"
                />
                <Input
                  value={field.fontColor}
                  onChange={(e) => update({ fontColor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("template.settings.text_align")}</Label>
              <Select
                value={field.textAlign}
                onValueChange={(v) => update({ textAlign: v as TemplateField["textAlign"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* Background & Border */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t("template.settings.background_color")}</Label>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">{t("template.settings.transparent")}</Label>
            <Switch
              checked={!field.backgroundColor || field.backgroundColor === "transparent"}
              onCheckedChange={(checked) =>
                update({ backgroundColor: checked ? "" : "#ffffff" })
              }
            />
          </div>
        </div>
        {field.backgroundColor && field.backgroundColor !== "transparent" && (
          <div className="flex gap-1">
            <input
              type="color"
              value={field.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="h-9 w-9 cursor-pointer rounded border"
            />
            <Input
              value={field.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
            />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("template.settings.border_radius")}</Label>
        <Input
          type="number"
          min={0}
          value={field.borderRadius}
          onChange={(e) => update({ borderRadius: Number(e.target.value) })}
        />
      </div>

      {/* Visible */}
      <div className="flex items-center justify-between">
        <Label className="text-xs">{t("template.settings.visible")}</Label>
        <Switch checked={field.visible} onCheckedChange={(v) => update({ visible: v })} />
      </div>
    </div>
  );
}
