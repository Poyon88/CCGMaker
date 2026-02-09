import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { useAuthStore } from "@/stores/auth-store";
import { useGuestStore } from "@/stores/guest-store";

export default function SettingsPage() {
  const { t } = useTranslation("settings");
  const { isGuest } = useAuthStore();
  const clearAll = useGuestStore((s) => s.clearAll);

  const [displayName, setDisplayName] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title={t("title")} />

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">{t("profile.display_name")}</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={isGuest ? "Guest" : ""}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t("profile.email")}</Label>
            <Input value={isGuest ? "guest@ccgmaker.com" : ""} disabled />
          </div>
          <Button size="sm" disabled={isGuest}>
            {t("profile.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>{t("language.title")}</CardTitle>
          <CardDescription>{t("language.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("danger.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            disabled={isGuest}
            onClick={async () => {
              const { signOut } = await import("@/services/auth.service");
              await signOut();
              useAuthStore.getState().reset();
              window.location.href = "/";
            }}
          >
            {t("danger.logout")}
          </Button>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("danger.delete_warning")}</p>
            {isGuest ? (
              <Button
                variant="destructive"
                onClick={() => {
                  clearAll();
                  window.location.href = "/";
                }}
              >
                Clear All Guest Data
              </Button>
            ) : (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">{t("danger.delete_confirm")}</Label>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                  />
                </div>
                <Button
                  variant="destructive"
                  disabled={deleteConfirm !== "DELETE"}
                  onClick={() => setShowDelete(true)}
                >
                  {t("danger.delete_button")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title={t("danger.delete_account")}
        description={t("danger.delete_warning")}
        onConfirm={() => {
          // Will be connected to Supabase later
          setShowDelete(false);
        }}
      />
    </div>
  );
}
