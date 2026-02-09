export interface Card {
  id: string;
  projectId: string | null;
  templateId: string | null;
  userId: string;
  name: string;
  fieldValues: Record<string, string>;
  illustrationUrl: string | null;
  cardTypeId: string | null;
  rarityId: string | null;
  tribeId: string | null;
  powerIds: string[];
  thumbnailUrl: string | null;
  isAiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}
