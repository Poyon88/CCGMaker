import type { TemplateDefinition, TemplateField } from "@/types/template";
import { cn } from "@/lib/utils";

interface CardRendererProps {
  definition: TemplateDefinition;
  fieldValues?: Record<string, string>;
  scale?: number;
  selectedFieldId?: string | null;
  onFieldClick?: (fieldId: string) => void;
  className?: string;
}

const PLACEHOLDER_VALUES: Record<TemplateField["type"], string> = {
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

export function CardRenderer({
  definition,
  fieldValues = {},
  scale = 1,
  selectedFieldId,
  onFieldClick,
  className,
}: CardRendererProps) {
  const { width, height, backgroundColor, borderColor, borderWidth, borderRadius, fields } =
    definition;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        width: width * scale,
        height: height * scale,
        backgroundColor,
        border: `${borderWidth * scale}px solid ${borderColor}`,
        borderRadius: borderRadius * scale,
      }}
    >
      {fields
        .filter((f) => f.visible)
        .map((field) => (
          <CardRendererField
            key={field.id}
            field={field}
            value={fieldValues[field.id] ?? PLACEHOLDER_VALUES[field.type]}
            scale={scale}
            isSelected={selectedFieldId === field.id}
            onClick={onFieldClick ? () => onFieldClick(field.id) : undefined}
          />
        ))}
    </div>
  );
}

interface CardRendererFieldProps {
  field: TemplateField;
  value: string;
  scale: number;
  isSelected?: boolean;
  onClick?: () => void;
}

function CardRendererField({ field, value, scale, isSelected, onClick }: CardRendererFieldProps) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${field.x}%`,
    top: `${field.y}%`,
    width: `${field.width}%`,
    height: `${field.height}%`,
    fontSize: field.fontSize * scale,
    fontFamily: field.fontFamily,
    fontWeight: field.fontWeight as React.CSSProperties["fontWeight"],
    color: field.fontColor,
    textAlign: field.textAlign,
    backgroundColor: field.backgroundColor || "transparent",
    borderRadius: field.borderRadius * scale,
    overflow: "hidden",
    display: "flex",
    alignItems: field.type === "illustration" ? "stretch" : "center",
    justifyContent:
      field.textAlign === "center"
        ? "center"
        : field.textAlign === "right"
          ? "flex-end"
          : "flex-start",
    padding: `${2 * scale}px ${4 * scale}px`,
    cursor: onClick ? "pointer" : undefined,
    outline: isSelected ? `${2 * scale}px solid #3b82f6` : undefined,
    outlineOffset: isSelected ? `${1 * scale}px` : undefined,
  };

  const interactive = !!onClick;
  const interactiveProps = interactive
    ? {
        role: "button" as const,
        tabIndex: 0,
        "aria-label": `Select ${field.label || field.type} field`,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        },
      }
    : {};

  if (field.type === "illustration") {
    return (
      <div style={style} onClick={onClick} {...interactiveProps}>
        {value ? (
          <img
            src={value}
            alt="Card illustration"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundColor: field.backgroundColor || "#e5e7eb",
              fontSize: field.fontSize * scale * 0.5,
              color: "#9ca3af",
            }}
            aria-hidden="true"
          >
            IMG
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={style} onClick={onClick} {...interactiveProps}>
      <span className="truncate">{value}</span>
    </div>
  );
}
