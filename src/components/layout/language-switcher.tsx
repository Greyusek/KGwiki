"use client";

import { useLanguage } from "@/components/layout/language-provider";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-xs">
      <Button type="button" size="sm" variant={language === "ru" ? "secondary" : "ghost"} onClick={() => setLanguage("ru")}>RU</Button>
      <span className="text-muted-foreground">|</span>
      <Button type="button" size="sm" variant={language === "en" ? "secondary" : "ghost"} onClick={() => setLanguage("en")}>EN</Button>
    </div>
  );
}
