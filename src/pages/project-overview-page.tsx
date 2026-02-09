import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, FileText, BookOpen, Plus } from "lucide-react";
import { useCards } from "@/hooks/use-cards";
import { useTemplates } from "@/hooks/use-templates";
import { useRules } from "@/hooks/use-rules";

export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const { t } = useTranslation("project");
  const { cards } = useCards(projectId);
  const { templates } = useTemplates(projectId);
  const { rules } = useRules(projectId ?? "");

  const stats = [
    {
      label: t("view.cards"),
      value: cards.length,
      icon: Layers,
      href: `/projects/${projectId}/cards`,
      action: `/projects/${projectId}/cards/new`,
    },
    {
      label: t("view.templates"),
      value: templates.length,
      icon: FileText,
      href: `/projects/${projectId}/templates`,
      action: `/projects/${projectId}/templates/new`,
    },
    {
      label: t("view.rules"),
      value:
        rules.cardTypes.length +
        rules.attributes.length +
        rules.rarities.length +
        rules.powers.length +
        rules.tribes.length,
      icon: BookOpen,
      href: `/projects/${projectId}/rules`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="mt-3 flex gap-2">
              <Link to={stat.href}>
                <Button variant="outline" size="sm">
                  View {stat.label.toLowerCase()}
                </Button>
              </Link>
              {stat.action && (
                <Link to={stat.action}>
                  <Button size="sm">
                    <Plus className="mr-1 h-3 w-3" />
                    New {stat.label.toLowerCase().replace(/s$/, "")}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
