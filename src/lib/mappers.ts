import type { Tables, Json } from "@/types/database";
import type { Project, CardType, Attribute, Rarity, Power, Tribe } from "@/types/project";
import type { Template, TemplateDefinition, TemplateStyle } from "@/types/template";
import type { Card } from "@/types/card";

// ── Projects ──

export function mapDbProject(row: Tables<"projects">): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProjectToInsert(p: Project) {
  return {
    id: p.id,
    user_id: p.userId,
    name: p.name,
    description: p.description,
  };
}

// ── Card Types ──

export function mapDbCardType(row: Tables<"card_types">): CardType {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export function mapCardTypeToInsert(item: CardType) {
  return {
    id: item.id,
    project_id: item.projectId,
    name: item.name,
    description: item.description,
    sort_order: item.sortOrder,
  };
}

// ── Attributes ──

export function mapDbAttribute(row: Tables<"attributes">): Attribute {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    valueType: row.value_type as Attribute["valueType"],
    defaultValue: row.default_value,
    minValue: row.min_value,
    maxValue: row.max_value,
    sortOrder: row.sort_order,
  };
}

export function mapAttributeToInsert(item: Attribute) {
  return {
    id: item.id,
    project_id: item.projectId,
    name: item.name,
    value_type: item.valueType,
    default_value: item.defaultValue,
    min_value: item.minValue,
    max_value: item.maxValue,
    sort_order: item.sortOrder,
  };
}

// ── Rarities ──

export function mapDbRarity(row: Tables<"rarities">): Rarity {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    color: row.color,
    iconUrl: row.icon_url,
    sortOrder: row.sort_order,
  };
}

export function mapRarityToInsert(item: Rarity) {
  return {
    id: item.id,
    project_id: item.projectId,
    name: item.name,
    color: item.color,
    icon_url: item.iconUrl,
    sort_order: item.sortOrder,
  };
}

// ── Powers ──

export function mapDbPower(row: Tables<"powers">): Power {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export function mapPowerToInsert(item: Power) {
  return {
    id: item.id,
    project_id: item.projectId,
    name: item.name,
    description: item.description,
    sort_order: item.sortOrder,
  };
}

// ── Tribes ──

export function mapDbTribe(row: Tables<"tribes">): Tribe {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export function mapTribeToInsert(item: Tribe) {
  return {
    id: item.id,
    project_id: item.projectId,
    name: item.name,
    description: item.description,
    sort_order: item.sortOrder,
  };
}

// ── Templates ──

export function mapDbTemplate(row: Tables<"templates">): Template {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    definition: row.definition as unknown as TemplateDefinition,
    style: row.style as unknown as TemplateStyle,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTemplateToInsert(t: Template) {
  return {
    id: t.id,
    project_id: t.projectId,
    name: t.name,
    description: t.description,
    definition: t.definition as unknown as Json,
    style: t.style as unknown as Json,
    thumbnail_url: t.thumbnailUrl,
  };
}

// ── Cards ──

export function mapDbCard(row: Tables<"cards">): Card {
  return {
    id: row.id,
    projectId: row.project_id,
    templateId: row.template_id,
    userId: row.user_id,
    name: row.name,
    fieldValues: (row.field_values ?? {}) as Record<string, string>,
    illustrationUrl: row.illustration_url,
    cardTypeId: row.card_type_id,
    rarityId: row.rarity_id,
    tribeId: row.tribe_id,
    powerIds: [],
    thumbnailUrl: row.thumbnail_url,
    isAiGenerated: row.is_ai_generated,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCardToInsert(c: Card, userId: string) {
  return {
    id: c.id,
    project_id: c.projectId,
    template_id: c.templateId,
    user_id: userId,
    name: c.name,
    field_values: c.fieldValues as unknown as Json,
    illustration_url: c.illustrationUrl,
    card_type_id: c.cardTypeId,
    rarity_id: c.rarityId,
    tribe_id: c.tribeId,
    thumbnail_url: c.thumbnailUrl,
    is_ai_generated: c.isAiGenerated,
  };
}
