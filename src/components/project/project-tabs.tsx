import { NavLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LayoutGrid, Layers, FileText, BookOpen, Wand2 } from "lucide-react";

const tabs: { key: string; path: string; icon: typeof LayoutGrid; end?: boolean }[] = [
  { key: "overview", path: "", icon: LayoutGrid, end: true },
  { key: "cards", path: "/cards", icon: Layers },
  { key: "templates", path: "/templates", icon: FileText },
  { key: "rules", path: "/rules", icon: BookOpen },
  { key: "ai_create", path: "/ai-create", icon: Wand2 },
];

export function ProjectTabs() {
  const { t } = useTranslation("project");
  const { projectId } = useParams();
  const basePath = `/projects/${projectId}`;

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={`${basePath}${tab.path}`}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
            )
          }
        >
          <tab.icon className="h-4 w-4" />
          {t(`view.${tab.key}`)}
        </NavLink>
      ))}
    </nav>
  );
}
