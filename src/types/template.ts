export interface TemplateField {
  id: string;
  type:
    | "name"
    | "illustration"
    | "description"
    | "stat"
    | "type"
    | "rarity"
    | "power"
    | "tribe"
    | "custom_text";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontColor: string;
  textAlign: "left" | "center" | "right";
  backgroundColor: string;
  borderRadius: number;
  visible: boolean;
  attributeId?: string;
}

export interface TemplateDefinition {
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  fields: TemplateField[];
  backgroundImage?: string;
  backgroundImageFit?: "cover" | "contain" | "fill";
}

export interface TemplateStyle {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface Template {
  id: string;
  projectId: string;
  name: string;
  description: string;
  definition: TemplateDefinition;
  style: TemplateStyle;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
