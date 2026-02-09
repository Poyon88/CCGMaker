import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords, BarChart3, Sparkles, Zap, Users } from "lucide-react";
import { CardTypesEditor } from "./card-types-editor";
import { AttributesEditor } from "./attributes-editor";
import { RaritiesEditor } from "./rarities-editor";
import { PowersEditor } from "./powers-editor";
import { TribesEditor } from "./tribes-editor";
import { useRules, useUpdateRules } from "@/hooks/use-rules";
import type { GuestRules } from "@/stores/guest-store";

interface RulesEditorProps {
  projectId: string;
}

export function RulesEditor({ projectId }: RulesEditorProps) {
  const { t } = useTranslation("project");
  const { rules } = useRules(projectId);
  const updateRules = useUpdateRules();

  const handleUpdate = (key: keyof GuestRules) => (items: GuestRules[typeof key]) => {
    updateRules.mutate({ projectId, key, items });
  };

  const tabs = [
    { key: "cardTypes", label: t("rules.card_types"), icon: Swords },
    { key: "attributes", label: t("rules.attributes"), icon: BarChart3 },
    { key: "rarities", label: t("rules.rarities"), icon: Sparkles },
    { key: "powers", label: t("rules.powers"), icon: Zap },
    { key: "tribes", label: t("rules.tribes"), icon: Users },
  ];

  return (
    <Tabs defaultValue="cardTypes" className="space-y-4">
      <TabsList className="flex-wrap">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="cardTypes">
        <CardTypesEditor
          items={rules.cardTypes}
          projectId={projectId}
          onUpdate={handleUpdate("cardTypes")}
        />
      </TabsContent>

      <TabsContent value="attributes">
        <AttributesEditor
          items={rules.attributes}
          projectId={projectId}
          onUpdate={handleUpdate("attributes")}
        />
      </TabsContent>

      <TabsContent value="rarities">
        <RaritiesEditor
          items={rules.rarities}
          projectId={projectId}
          onUpdate={handleUpdate("rarities")}
        />
      </TabsContent>

      <TabsContent value="powers">
        <PowersEditor
          items={rules.powers}
          projectId={projectId}
          onUpdate={handleUpdate("powers")}
        />
      </TabsContent>

      <TabsContent value="tribes">
        <TribesEditor
          items={rules.tribes}
          projectId={projectId}
          onUpdate={handleUpdate("tribes")}
        />
      </TabsContent>
    </Tabs>
  );
}
