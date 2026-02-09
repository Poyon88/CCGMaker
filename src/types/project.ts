export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardType {
  id: string;
  projectId: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface Attribute {
  id: string;
  projectId: string;
  name: string;
  valueType: "number" | "text" | "boolean";
  defaultValue: string;
  minValue: number | null;
  maxValue: number | null;
  sortOrder: number;
}

export interface Rarity {
  id: string;
  projectId: string;
  name: string;
  color: string;
  iconUrl: string | null;
  sortOrder: number;
}

export interface Power {
  id: string;
  projectId: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface Tribe {
  id: string;
  projectId: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface ProjectRules {
  cardTypes: CardType[];
  attributes: Attribute[];
  rarities: Rarity[];
  powers: Power[];
  tribes: Tribe[];
}
