import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sparkles, Layers, Download, Wand2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/config/routes";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export default function LandingPage() {
  const { t } = useTranslation(["auth", "common"]);
  const setGuest = useAuthStore((s) => s.setGuest);

  const handleGuestMode = () => {
    setGuest(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">{t("common:app_name")}</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost">{t("auth:login.submit")}</Button>
            </Link>
            <Link to={ROUTES.SIGNUP}>
              <Button>{t("auth:signup.submit")}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-bold tracking-tight">
            Create Your Own
            <span className="text-primary"> Card Game</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Design cards, define game mechanics, generate AI illustrations, and
            export print-ready sheets. All in one place.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to={ROUTES.SIGNUP}>
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link to={ROUTES.DASHBOARD} onClick={handleGuestMode}>
              <Button size="lg" variant="outline">
                {t("auth:guest.try_free")}
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Layers, title: "Card Templates", description: "Create custom templates with flexible field layouts, colors, and fonts." },
              { icon: Sparkles, title: "Visual Editor", description: "Design cards with a real-time preview editor. See changes instantly." },
              { icon: Wand2, title: "AI Generation", description: "Generate complete cards with AI \u2014 illustrations, stats, and effects." },
              { icon: Download, title: "Export Ready", description: "Export print-ready PDF sheets or JSON data for digital integration." },
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg border bg-card p-6 text-card-foreground">
                <feature.icon className="h-10 w-10 text-primary" />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
