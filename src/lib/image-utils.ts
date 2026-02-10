export const BACKGROUND_IMAGE_LIMITS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ACCEPTED_MIME_TYPES: ["image/png", "image/jpeg", "application/pdf"] as const,
  TARGET_WIDTH: 750,
  TARGET_HEIGHT: 1050,
} as const;

export function validateBackgroundFile(file: File): { valid: boolean; errorKey?: string } {
  if (
    !BACKGROUND_IMAGE_LIMITS.ACCEPTED_MIME_TYPES.includes(
      file.type as (typeof BACKGROUND_IMAGE_LIMITS.ACCEPTED_MIME_TYPES)[number],
    )
  ) {
    return { valid: false, errorKey: "template.background_image.error_type" };
  }
  if (file.size > BACKGROUND_IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
    return { valid: false, errorKey: "template.background_image.error_size" };
  }
  return { valid: true };
}

export function resizeImageToDataUrl(
  source: string,
  maxWidth: number,
  maxHeight: number,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = source;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
