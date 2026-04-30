"use client";

import { useLanguage } from "@/components/layout/language-provider";

export function NavLabel({ tKey }: { tKey: string }) {
  const { t } = useLanguage();
  return <>{t(tKey)}</>;
}
