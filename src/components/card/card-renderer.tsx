import { useRef, useEffect, useCallback } from "react";
import type { TemplateDefinition, TemplateField } from "@/types/template";
import { cn } from "@/lib/utils";

interface CardRendererProps {
  definition: TemplateDefinition;
  fieldValues?: Record<string, string>;
  scale?: number;
  selectedFieldId?: string | null;
  onFieldClick?: (fieldId: string) => void;
  onFieldMove?: (fieldId: string, x: number, y: number) => void;
  onFieldResize?: (fieldId: string, width: number, height: number, x: number, y: number) => void;
  onIllustrationClick?: (fieldId: string) => void;
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

type ResizeCorner = "nw" | "ne" | "sw" | "se";

interface DragState {
  type: "move" | "resize";
  fieldId: string;
  startMouseX: number;
  startMouseY: number;
  startFieldX: number;
  startFieldY: number;
  startFieldW: number;
  startFieldH: number;
  resizeCorner?: ResizeCorner;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function CardRenderer({
  definition,
  fieldValues = {},
  scale = 1,
  selectedFieldId,
  onFieldClick,
  onFieldMove,
  onFieldResize,
  onIllustrationClick,
  className,
}: CardRendererProps) {
  const { width, height, backgroundColor, borderColor, borderWidth, borderRadius, fields, backgroundImage, backgroundImageFit } =
    definition;

  const hasBackgroundImage = !!backgroundImage;
  const isEditable = !!(onFieldMove || onFieldResize);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const isDraggingRef = useRef(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const drag = dragRef.current;
      const container = containerRef.current;
      if (!drag || !container) return;

      isDraggingRef.current = true;
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const containerW = rect.width;
      const containerH = rect.height;

      const deltaXPct = ((e.clientX - drag.startMouseX) / containerW) * 100;
      const deltaYPct = ((e.clientY - drag.startMouseY) / containerH) * 100;

      if (drag.type === "move" && onFieldMove) {
        const newX = clamp(drag.startFieldX + deltaXPct, 0, 100 - drag.startFieldW);
        const newY = clamp(drag.startFieldY + deltaYPct, 0, 100 - drag.startFieldH);
        onFieldMove(drag.fieldId, newX, newY);
      } else if (drag.type === "resize" && onFieldResize) {
        let newX = drag.startFieldX;
        let newY = drag.startFieldY;
        let newW = drag.startFieldW;
        let newH = drag.startFieldH;

        const corner = drag.resizeCorner!;

        if (corner === "se") {
          newW = clamp(drag.startFieldW + deltaXPct, 5, 100 - drag.startFieldX);
          newH = clamp(drag.startFieldH + deltaYPct, 3, 100 - drag.startFieldY);
        } else if (corner === "sw") {
          const proposedDx = clamp(deltaXPct, -drag.startFieldX, drag.startFieldW - 5);
          newX = drag.startFieldX + proposedDx;
          newW = drag.startFieldW - proposedDx;
          newH = clamp(drag.startFieldH + deltaYPct, 3, 100 - drag.startFieldY);
        } else if (corner === "ne") {
          newW = clamp(drag.startFieldW + deltaXPct, 5, 100 - drag.startFieldX);
          const proposedDy = clamp(deltaYPct, -drag.startFieldY, drag.startFieldH - 3);
          newY = drag.startFieldY + proposedDy;
          newH = drag.startFieldH - proposedDy;
        } else if (corner === "nw") {
          const proposedDx = clamp(deltaXPct, -drag.startFieldX, drag.startFieldW - 5);
          newX = drag.startFieldX + proposedDx;
          newW = drag.startFieldW - proposedDx;
          const proposedDy = clamp(deltaYPct, -drag.startFieldY, drag.startFieldH - 3);
          newY = drag.startFieldY + proposedDy;
          newH = drag.startFieldH - proposedDy;
        }

        onFieldResize(drag.fieldId, newW, newH, newX, newY);
      }
    },
    [onFieldMove, onFieldResize],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const startDrag = (e: React.MouseEvent, field: TemplateField, type: "move" | "resize", corner?: ResizeCorner) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = false;

    dragRef.current = {
      type,
      fieldId: field.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startFieldX: field.x,
      startFieldY: field.y,
      startFieldW: field.width,
      startFieldH: field.height,
      resizeCorner: corner,
    };

    document.body.style.cursor = type === "move" ? "grabbing" : `${corner}-resize`;
    document.body.style.userSelect = "none";
  };

  const handleFieldMouseDown = (e: React.MouseEvent, field: TemplateField) => {
    if (!isEditable) return;
    // Only left button
    if (e.button !== 0) return;
    onFieldClick?.(field.id);
    startDrag(e, field, "move");
  };

  const handleResizeMouseDown = (e: React.MouseEvent, field: TemplateField, corner: ResizeCorner) => {
    if (!isEditable) return;
    if (e.button !== 0) return;
    startDrag(e, field, "resize", corner);
  };

  const handleFieldClick = (e: React.MouseEvent, fieldId: string) => {
    // Only fire click if we didn't drag
    if (!isDraggingRef.current) {
      onFieldClick?.(fieldId);
    }
    e.stopPropagation();
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        width: width * scale,
        height: height * scale,
        ...(hasBackgroundImage
          ? {
              backgroundColor: "transparent",
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: backgroundImageFit === "contain" ? "contain"
                : backgroundImageFit === "fill" ? "100% 100%"
                : "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : {
              backgroundColor,
              border: `${borderWidth * scale}px solid ${borderColor}`,
              borderRadius: borderRadius * scale,
            }),
      }}
      onClick={() => {
        if (!isDraggingRef.current && onFieldClick) {
          // Click on empty area deselects
        }
      }}
    >
      {fields
        .filter((f) => f.visible)
        .map((field) => {
          const isSelected = selectedFieldId === field.id;
          return (
            <CardRendererField
              key={field.id}
              field={field}
              value={fieldValues[field.id] ?? PLACEHOLDER_VALUES[field.type]}
              scale={scale}
              isSelected={isSelected}
              isEditable={isEditable}
              onClick={onFieldClick ? (e: React.MouseEvent) => handleFieldClick(e, field.id) : undefined}
              onMouseDown={isEditable ? (e: React.MouseEvent) => handleFieldMouseDown(e, field) : undefined}
              onResizeMouseDown={
                isEditable && isSelected
                  ? (e: React.MouseEvent, corner: ResizeCorner) => handleResizeMouseDown(e, field, corner)
                  : undefined
              }
              onIllustrationClick={
                onIllustrationClick && field.type === "illustration"
                  ? () => onIllustrationClick(field.id)
                  : undefined
              }
            />
          );
        })}
    </div>
  );
}

interface CardRendererFieldProps {
  field: TemplateField;
  value: string;
  scale: number;
  isSelected?: boolean;
  isEditable?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onResizeMouseDown?: (e: React.MouseEvent, corner: ResizeCorner) => void;
  onIllustrationClick?: () => void;
}

const HANDLE_SIZE = 8;

function ResizeHandles({
  scale,
  onResizeMouseDown,
}: {
  scale: number;
  onResizeMouseDown: (e: React.MouseEvent, corner: ResizeCorner) => void;
}) {
  const size = HANDLE_SIZE;
  const offset = -size / 2;

  const corners: { corner: ResizeCorner; style: React.CSSProperties; cursor: string }[] = [
    { corner: "nw", style: { top: offset, left: offset }, cursor: "nw-resize" },
    { corner: "ne", style: { top: offset, right: offset }, cursor: "ne-resize" },
    { corner: "sw", style: { bottom: offset, left: offset }, cursor: "sw-resize" },
    { corner: "se", style: { bottom: offset, right: offset }, cursor: "se-resize" },
  ];

  return (
    <>
      {corners.map(({ corner, style, cursor }) => (
        <div
          key={corner}
          onMouseDown={(e) => onResizeMouseDown(e, corner)}
          style={{
            position: "absolute",
            width: size,
            height: size,
            backgroundColor: "white",
            border: `${Math.max(1, scale)}px solid #3b82f6`,
            borderRadius: 1,
            cursor,
            zIndex: 10,
            ...style,
          }}
        />
      ))}
    </>
  );
}

function CardRendererField({
  field,
  value,
  scale,
  isSelected,
  isEditable,
  onClick,
  onMouseDown,
  onResizeMouseDown,
  onIllustrationClick,
}: CardRendererFieldProps) {
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
    borderRadius: field.type === "illustration" && field.clipShape === "ellipse"
      ? "50%"
      : field.borderRadius * scale,
    overflow: "hidden",
    display: "flex",
    alignItems: field.type === "illustration" ? "stretch" : "center",
    justifyContent:
      field.textAlign === "center"
        ? "center"
        : field.textAlign === "right"
          ? "flex-end"
          : "flex-start",
    padding: field.type === "illustration" ? 0 : `${2 * scale}px ${4 * scale}px`,
    cursor: isEditable ? "grab" : onClick ? "pointer" : undefined,
    outline: isSelected ? `${2 * scale}px solid #3b82f6` : undefined,
    outlineOffset: isSelected ? `${1 * scale}px` : undefined,
  };

  const interactive = !!(onClick || onMouseDown);
  const interactiveProps = interactive
    ? {
        role: "button" as const,
        tabIndex: 0,
        "aria-label": `Select ${field.label || field.type} field`,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(e as unknown as React.MouseEvent);
          }
        },
      }
    : {};

  if (field.type === "illustration") {
    const illustrationCursor = onIllustrationClick ? "pointer" : isEditable ? "grab" : onClick ? "pointer" : undefined;
    return (
      <div
        style={{ ...style, cursor: illustrationCursor }}
        onClick={(e) => {
          if (onIllustrationClick) {
            e.stopPropagation();
            onIllustrationClick();
          } else {
            onClick?.(e);
          }
        }}
        onMouseDown={onIllustrationClick ? undefined : onMouseDown}
        {...(onIllustrationClick ? {} : interactiveProps)}
      >
        {value ? (
          <img
            src={value}
            alt="Card illustration"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "fill",
              display: "block",
            }}
            draggable={false}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-1"
            style={{
              backgroundColor: field.backgroundColor || "#e5e7eb",
              fontSize: field.fontSize * scale * 0.5,
              color: "#9ca3af",
            }}
          >
            {onIllustrationClick ? (
              <>
                <svg width={24 * scale} height={24 * scale} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span style={{ fontSize: Math.max(8, field.fontSize * scale * 0.35) }}>
                  Cliquez pour importer
                </span>
              </>
            ) : (
              "IMG"
            )}
          </div>
        )}
        {isSelected && onResizeMouseDown && (
          <ResizeHandles scale={scale} onResizeMouseDown={onResizeMouseDown} />
        )}
      </div>
    );
  }

  return (
    <div style={style} onClick={onClick} onMouseDown={onMouseDown} {...interactiveProps}>
      <span className="truncate">{value}</span>
      {isSelected && onResizeMouseDown && (
        <ResizeHandles scale={scale} onResizeMouseDown={onResizeMouseDown} />
      )}
    </div>
  );
}
