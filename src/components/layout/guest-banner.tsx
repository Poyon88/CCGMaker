import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/config/routes";

export function GuestBanner() {
  const { t } = useTranslation("common");
  const isGuest = useAuthStore((s) => s.isGuest);

  if (!isGuest) return null;

  return (
    <div className="flex items-center gap-3 border-b bg-primary/5 px-4 py-2 text-sm">
      <Info className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-muted-foreground">
        {t("guest_banner.message")}
      </p>
      <Link to={ROUTES.SIGNUP}>
        <Button size="sm" variant="outline">
          {t("guest_banner.cta")}
        </Button>
      </Link>
    </div>
  );
}
