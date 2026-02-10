import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";
import { uploadBackgroundImage, deleteBackgroundImage } from "@/services/storage.service";
import {
  validateBackgroundFile,
  fileToDataUrl,
  resizeImageToDataUrl,
  BACKGROUND_IMAGE_LIMITS,
} from "@/lib/image-utils";
import { pdfFirstPageToDataUrl } from "@/lib/pdf-to-image";

interface BackgroundImageUploaderProps {
  backgroundImage: string | undefined;
  backgroundImageFit: "cover" | "contain" | "fill" | undefined;
  templateId: string;
  isGuest: boolean;
  onChange: (patch: { backgroundImage?: string | undefined; backgroundImageFit?: "cover" | "contain" | "fill" }) => void;
}

export function BackgroundImageUploader({
  backgroundImage,
  backgroundImageFit,
  templateId,
  isGuest,
  onChange,
}: BackgroundImageUploaderProps) {
  const { t } = useTranslation("project");
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    e.target.value = "";

    const validation = validateBackgroundFile(file);
    if (!validation.valid) {
      toast.error(t(validation.errorKey!));
      return;
    }

    setLoading(true);
    try {
      let imageDataUrl: string;

      if (file.type === "application/pdf") {
        imageDataUrl = await pdfFirstPageToDataUrl(
          file,
          BACKGROUND_IMAGE_LIMITS.TARGET_WIDTH,
          BACKGROUND_IMAGE_LIMITS.TARGET_HEIGHT,
        );
      } else {
        imageDataUrl = await fileToDataUrl(file);
      }

      if (isGuest || !user) {
        // Guest: resize and store as base64
        const resized = await resizeImageToDataUrl(
          imageDataUrl,
          BACKGROUND_IMAGE_LIMITS.TARGET_WIDTH,
          BACKGROUND_IMAGE_LIMITS.TARGET_HEIGHT,
        );
        onChange({ backgroundImage: resized, backgroundImageFit: backgroundImageFit ?? "cover" });
      } else {
        // Authenticated: upload to Supabase Storage
        const blob = await fetch(imageDataUrl).then((r) => r.blob());
        const ext = file.type === "application/pdf" ? "png" : file.name.split(".").pop() ?? "png";
        const url = await uploadBackgroundImage(user.id, templateId, blob, ext);
        onChange({ backgroundImage: url, backgroundImageFit: backgroundImageFit ?? "cover" });
      }
    } catch (err) {
      console.error("Background image upload failed:", err);
      toast.error(t("template.background_image.error_upload"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!isGuest && user) {
      try {
        await deleteBackgroundImage(user.id, templateId);
      } catch (err) {
        console.error("Failed to delete background image:", err);
      }
    }
    onChange({ backgroundImage: undefined });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{t("template.background_image.label")}</Label>

      {backgroundImage ? (
        <div className="flex items-center gap-2">
          <div
            className="h-16 w-11 shrink-0 overflow-hidden rounded border bg-muted"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
              {t("template.background_image.replace")}
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleRemove}
              disabled={loading}
            >
              <Trash2 />
              {t("template.background_image.remove")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {t("template.background_image.upload")}
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {backgroundImage && (
        <div className="space-y-1">
          <Label className="text-xs">{t("template.background_image.fit")}</Label>
          <Select
            value={backgroundImageFit ?? "cover"}
            onValueChange={(v) => onChange({ backgroundImageFit: v as "cover" | "contain" | "fill" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">{t("template.background_image.fit_cover")}</SelectItem>
              <SelectItem value="contain">{t("template.background_image.fit_contain")}</SelectItem>
              <SelectItem value="fill">{t("template.background_image.fit_fill")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
