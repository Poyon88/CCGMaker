export interface PDFExportSettings {
  pageSize: "A4" | "Letter";
  cardsPerRow: number;
  marginMm: number;
  includeBleed: boolean;
}

export interface JSONExportOptions {
  includeRules: boolean;
  includeTemplates: boolean;
  selectedCardIds: string[];
}
