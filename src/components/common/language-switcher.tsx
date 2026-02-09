import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "fr" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} aria-label="Switch language">
      <Languages className="mr-1 h-4 w-4" />
      {i18n.language === "en" ? "FR" : "EN"}
    </Button>
  );
}
