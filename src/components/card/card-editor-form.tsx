import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fileToDataUrl, resizeImageToDataUrl } from "@/lib/image-utils";
import type { TemplateField } from "@/types/template";

interface CardEditorFormProps {
  fields: TemplateField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

function IllustrationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation("card");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await fileToDataUrl(file);
    const resized = await resizeImageToDataUrl(dataUrl, 750, 1050);
    onChange(resized);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      {value ? (
        <div className="flex items-center gap-2">
          <img
            src={value}
            alt="Illustration"
            className="h-12 w-12 rounded border object-cover"
          />
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              {t("editor.replace_image")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange("")}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-1 h-4 w-4" />
          {t("editor.upload_image")}
        </Button>
      )}
    </div>
  );
}

export function CardEditorForm({ fields, values, onChange }: CardEditorFormProps) {
  const { t } = useTranslation("project");

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.id} className="space-y-1">
          <Label className="text-xs">
            {field.label}{" "}
            <span className="text-muted-foreground">
              ({t(`template.field_types.${field.type}`)})
            </span>
          </Label>
          {field.type === "description" ? (
            <Textarea
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              rows={3}
            />
          ) : field.type === "illustration" ? (
            <IllustrationField
              value={values[field.id] ?? ""}
              onChange={(v) => onChange(field.id, v)}
            />
          ) : (
            <Input
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
