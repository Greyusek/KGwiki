"use client";

import { useLanguage } from "@/components/layout/language-provider";

export function TText({ tKey }: { tKey: string }) {
  const { t } = useLanguage();
  return <>{t(tKey)}</>;
}
