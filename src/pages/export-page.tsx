import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import { Download, Copy, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { renderCardToCanvas } from "@/lib/render-card-to-canvas";
import { fetchAllTemplates } from "@/services/templates.service";
import { mapDbTemplate } from "@/lib/mappers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardRenderer } from "@/components/card/card-renderer";
import { useCards } from "@/hooks/use-cards";
import { useProjects } from "@/hooks/use-projects";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestStore } from "@/stores/guest-store";
function useAllTemplates() {
  const isGuest = useAuthStore((s) => s.isGuest);
  const guestTemplates = useGuestStore((s) => s.templates);

  const query = useQuery({
    queryKey: ["templates", "all"],
    queryFn: async () => {
      const rows = await fetchAllTemplates();
      return rows.map(mapDbTemplate);
    },
    enabled: !isGuest,
  });

  return {
    templates: isGuest ? guestTemplates : (query.data ?? []),
    isLoading: isGuest ? false : query.isLoading,
  };
}

export default function ExportPage() {
  const { t } = useTranslation("export");
  const { cards } = useCards();
  const { projects } = useProjects();
  const { templates: allTemplates } = useAllTemplates();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState("A4");
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [includeRules, setIncludeRules] = useState(true);
  const [includeTemplates, setIncludeTemplates] = useState(true);
  const [jsonMode, setJsonMode] = useState<"full" | "selected">("full");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const toggleCard = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(cards.map((c) => c.id)));
  const selectNone = () => setSelectedIds(new Set());

  const getTemplate = useCallback(
    (templateId: string | null) => allTemplates.find((tpl) => tpl.id === templateId),
    [allTemplates],
  );

  const handleDownloadPdf = useCallback(async () => {
    const selected = cards.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) return;

    setPdfGenerating(true);
    try {
      const pageMm = pageSize === "A4" ? { w: 210, h: 297 } : { w: 215.9, h: 279.4 };
      const marginMm = 10;
      const usableW = pageMm.w - marginMm * 2;
      const usableH = pageMm.h - marginMm * 2;
      const gapMm = 4;

      const cardWMm = (usableW - gapMm * (cardsPerRow - 1)) / cardsPerRow;

      const firstTpl = getTemplate(selected[0].templateId);
      const aspectRatio = firstTpl
        ? firstTpl.definition.height / firstTpl.definition.width
        : 1.4;
      const cardHMm = cardWMm * aspectRatio;

      const rowsPerPage = Math.max(1, Math.floor((usableH + gapMm) / (cardHMm + gapMm)));
      const cardsPerPage = cardsPerRow * rowsPerPage;

      // Render at 2x pixel density for sharp output
      const renderWidthPx = Math.round(cardWMm * 3.78 * 2);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: pageSize === "A4" ? "a4" : "letter",
      });

      let cardIndex = 0;
      for (const card of selected) {
        const tpl = getTemplate(card.templateId);
        if (!tpl) continue;

        const pageIdx = Math.floor(cardIndex / cardsPerPage);
        const posOnPage = cardIndex % cardsPerPage;
        const col = posOnPage % cardsPerRow;
        const row = Math.floor(posOnPage / cardsPerRow);

        if (posOnPage === 0 && pageIdx > 0) {
          pdf.addPage();
        }

        // Render card directly to a Canvas 2D (no html2canvas)
        const canvas = await renderCardToCanvas(
          tpl.definition,
          card.fieldValues,
          renderWidthPx,
        );

        const imgData = canvas.toDataURL("image/png");
        const x = marginMm + col * (cardWMm + gapMm);
        const y = marginMm + row * (cardHMm + gapMm);
        pdf.addImage(imgData, "PNG", x, y, cardWMm, cardHMm);

        cardIndex++;
      }

      pdf.save("ccgmaker-cards.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("PDF generation failed");
    } finally {
      setPdfGenerating(false);
    }
  }, [cards, selectedIds, pageSize, cardsPerRow, getTemplate]);

  const buildJsonData = () => {
    const selectedCards = jsonMode === "full" ? cards : cards.filter((c) => selectedIds.has(c.id));
    const data: Record<string, unknown> = { cards: selectedCards };
    if (includeTemplates) data.templates = allTemplates;
    if (jsonMode === "full") data.projects = projects;
    return JSON.stringify(data, null, 2);
  };

  const handleDownloadJson = () => {
    const json = buildJsonData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ccgmaker-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(buildJsonData());
  };

  if (cards.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader title={t("title")} />
        <EmptyState
          icon={Layers}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} />

      {/* Card selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">{t("select_cards")}</h3>
          <Button variant="outline" size="sm" onClick={selectAll}>
            All
          </Button>
          <Button variant="outline" size="sm" onClick={selectNone}>
            None
          </Button>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {selectedIds.size}/{cards.length}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cards.map((card) => {
            const tpl = getTemplate(card.templateId);
            const isSelected = selectedIds.has(card.id);
            return (
              <button
                key={card.id}
                onClick={() => toggleCard(card.id)}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? "Deselect" : "Select"} ${card.name || "Untitled"}`}
                className={`rounded-lg border p-2 text-left transition-colors ${
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex justify-center">
                  {tpl ? (
                    <CardRenderer
                      definition={tpl.definition}
                      fieldValues={card.fieldValues}
                      scale={0.2}
                    />
                  ) : (
                    <div className="h-[105px] w-[75px] rounded bg-muted" />
                  )}
                </div>
                <p className="mt-1 truncate text-xs">{card.name || "Untitled"}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export tabs */}
      <Tabs defaultValue="json">
        <TabsList>
          <TabsTrigger value="pdf">{t("format.pdf")}</TabsTrigger>
          <TabsTrigger value="json">{t("format.json")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="space-y-4">
          <div className="grid max-w-md gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("pdf.page_size")}</Label>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("pdf.cards_per_row")}</Label>
              <Select
                value={String(cardsPerRow)}
                onValueChange={(v) => setCardsPerRow(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            disabled={selectedIds.size === 0 || pdfGenerating}
            onClick={handleDownloadPdf}
          >
            {pdfGenerating ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1 h-4 w-4" />
            )}
            {pdfGenerating ? t("pdf.generating") : t("pdf.download")}
          </Button>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("json.options")}</Label>
              <Select
                value={jsonMode}
                onValueChange={(v) => setJsonMode(v as "full" | "selected")}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">{t("json.full_project")}</SelectItem>
                  <SelectItem value="selected">{t("json.selected_only")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={includeRules} onCheckedChange={setIncludeRules} />
              <Label className="text-sm">{t("json.include_rules")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={includeTemplates} onCheckedChange={setIncludeTemplates} />
              <Label className="text-sm">{t("json.include_templates")}</Label>
            </div>
          </div>

          {/* JSON preview */}
          <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-4 text-xs">
            {buildJsonData().slice(0, 2000)}
            {buildJsonData().length > 2000 && "\n..."}
          </pre>

          <div className="flex gap-2">
            <Button onClick={handleDownloadJson}>
              <Download className="mr-1 h-4 w-4" />
              {t("json.download")}
            </Button>
            <Button variant="outline" onClick={handleCopyJson}>
              <Copy className="mr-1 h-4 w-4" />
              {t("json.copy")}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
