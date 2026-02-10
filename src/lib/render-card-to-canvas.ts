import type { TemplateDefinition } from "@/types/template";

const PLACEHOLDER_VALUES: Record<string, string> = {
  name: "Card Name",
  illustration: "",
  description: "This is a sample card description that shows how text will appear on the card.",
  stat: "10",
  type: "Creature",
  rarity: "Rare",
  power: "Fireball",
  tribe: "Dragon",
  custom_text: "Custom",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function renderCardToCanvas(
  definition: TemplateDefinition,
  fieldValues: Record<string, string>,
  renderWidth: number,
): Promise<HTMLCanvasElement> {
  const { width, height, backgroundColor, borderColor, borderWidth, borderRadius, fields, backgroundImage, backgroundImageFit } =
    definition;

  const scale = renderWidth / width;
  const canvasW = Math.round(width * scale);
  const canvasH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;

  const hasBackgroundImage = !!backgroundImage;

  // Draw background
  if (hasBackgroundImage) {
    try {
      const bgImg = await loadImage(backgroundImage);
      const fit = backgroundImageFit ?? "cover";

      let sx = 0, sy = 0, sw = bgImg.width, sh = bgImg.height;
      let dx = 0, dy = 0, dw = canvasW, dh = canvasH;

      if (fit === "cover") {
        const imgRatio = bgImg.width / bgImg.height;
        const canvasRatio = canvasW / canvasH;
        if (imgRatio > canvasRatio) {
          sw = bgImg.height * canvasRatio;
          sx = (bgImg.width - sw) / 2;
        } else {
          sh = bgImg.width / canvasRatio;
          sy = (bgImg.height - sh) / 2;
        }
      } else if (fit === "contain") {
        const imgRatio = bgImg.width / bgImg.height;
        const canvasRatio = canvasW / canvasH;
        if (imgRatio > canvasRatio) {
          dh = canvasW / imgRatio;
          dy = (canvasH - dh) / 2;
        } else {
          dw = canvasH * imgRatio;
          dx = (canvasW - dw) / 2;
        }
      }
      // "fill" uses default (stretch to full canvas)

      ctx.drawImage(bgImg, sx, sy, sw, sh, dx, dy, dw, dh);
    } catch {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
  } else {
    // Solid background + border
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    if (borderWidth > 0) {
      const bw = borderWidth * scale;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = bw;
      const br = borderRadius * scale;
      if (br > 0) {
        ctx.beginPath();
        ctx.roundRect(bw / 2, bw / 2, canvasW - bw, canvasH - bw, br);
        ctx.stroke();
      } else {
        ctx.strokeRect(bw / 2, bw / 2, canvasW - bw, canvasH - bw);
      }
    }
  }

  // Draw fields
  for (const field of fields) {
    if (!field.visible) continue;

    const value = fieldValues[field.id] ?? PLACEHOLDER_VALUES[field.type] ?? "";
    const fx = (field.x / 100) * canvasW;
    const fy = (field.y / 100) * canvasH;
    const fw = (field.width / 100) * canvasW;
    const fh = (field.height / 100) * canvasH;

    // Field background
    if (field.backgroundColor && field.backgroundColor !== "transparent") {
      ctx.fillStyle = field.backgroundColor;
      const fbr = field.borderRadius * scale;
      if (fbr > 0) {
        ctx.beginPath();
        ctx.roundRect(fx, fy, fw, fh, fbr);
        ctx.fill();
      } else {
        ctx.fillRect(fx, fy, fw, fh);
      }
    }

    if (field.type === "illustration" && value) {
      try {
        const img = await loadImage(value);
        ctx.save();
        if (field.borderRadius > 0) {
          ctx.beginPath();
          ctx.roundRect(fx, fy, fw, fh, field.borderRadius * scale);
          ctx.clip();
        }
        ctx.drawImage(img, fx, fy, fw, fh);
        ctx.restore();
      } catch {
        // skip broken images
      }
    } else if (value) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(fx, fy, fw, fh);
      ctx.clip();

      const fontSize = field.fontSize * scale;
      ctx.font = `${field.fontWeight} ${fontSize}px ${field.fontFamily}`;
      ctx.fillStyle = field.fontColor;
      ctx.textBaseline = "middle";

      const padding = 4 * scale;
      let tx = fx + padding;
      if (field.textAlign === "center") {
        ctx.textAlign = "center";
        tx = fx + fw / 2;
      } else if (field.textAlign === "right") {
        ctx.textAlign = "right";
        tx = fx + fw - padding;
      } else {
        ctx.textAlign = "left";
      }

      ctx.fillText(value, tx, fy + fh / 2, fw - padding * 2);
      ctx.restore();
    }
  }

  return canvas;
}
