
import type { TemplateField, TemplateDefinition } from "@/types/template";
import { CARD_DIMENSIONS } from "@/config/constants";

function field(
  overrides: Partial<TemplateField> & Pick<TemplateField, "type" | "label" | "x" | "y" | "width" | "height">
): TemplateField {
  return {
    id: crypto.randomUUID(),
    fontSize: 14,
    fontFamily: "sans-serif",
    fontWeight: "normal",
    fontColor: "#1f2937",
    textAlign: "center",
    backgroundColor: "",
    borderRadius: 0,
    visible: true,
    ...overrides,
  };
}

export function createDefaultDefinition(): TemplateDefinition {
  return {
    width: CARD_DIMENSIONS.PREVIEW_WIDTH,
    height: CARD_DIMENSIONS.PREVIEW_HEIGHT,
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
    borderWidth: 2,
    borderRadius: 12,
    fields: [
      field({
        type: "name",
        label: "Name",
        x: 5,
        y: 2,
        width: 90,
        height: 8,
        fontSize: 20,
        fontWeight: "bold",
        fontColor: "#111827",
      }),
      field({
        type: "illustration",
        label: "Illustration",
        x: 5,
        y: 12,
        width: 90,
        height: 40,
        backgroundColor: "#e5e7eb",
      }),
      field({
        type: "type",
        label: "Type",
        x: 5,
        y: 54,
        width: 45,
        height: 6,
        fontSize: 12,
        fontColor: "#6b7280",
        textAlign: "left",
      }),
      field({
        type: "rarity",
        label: "Rarity",
        x: 50,
        y: 54,
        width: 45,
        height: 6,
        fontSize: 12,
        fontColor: "#6b7280",
        textAlign: "right",
      }),
      field({
        type: "description",
        label: "Description",
        x: 5,
        y: 62,
        width: 90,
        height: 20,
        fontSize: 11,
        textAlign: "left",
        fontColor: "#374151",
      }),
      field({
        type: "stat",
        label: "ATK",
        x: 5,
        y: 85,
        width: 20,
        height: 8,
        fontSize: 18,
        fontWeight: "bold",
        fontColor: "#dc2626",
        backgroundColor: "#fef2f2",
        borderRadius: 6,
      }),
      field({
        type: "stat",
        label: "DEF",
        x: 28,
        y: 85,
        width: 20,
        height: 8,
        fontSize: 18,
        fontWeight: "bold",
        fontColor: "#2563eb",
        backgroundColor: "#eff6ff",
        borderRadius: 6,
      }),
      field({
        type: "tribe",
        label: "Tribe",
        x: 55,
        y: 85,
        width: 40,
        height: 8,
        fontSize: 12,
        fontColor: "#4b5563",
        textAlign: "right",
      }),
    ],
  };
}
