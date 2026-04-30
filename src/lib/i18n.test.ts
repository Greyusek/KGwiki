import { describe, expect, it } from "vitest";

import { resolveLanguage, t } from "@/lib/i18n";

describe("i18n helper", () => {
  it("returns translated value for existing key", () => {
    expect(t("nav.home", "ru")).toBe("Главная");
    expect(t("nav.home", "en")).toBe("Home");
  });

  it("falls back to key when translation is missing", () => {
    expect(t("missing.key", "ru")).toBe("missing.key");
  });

  it("resolves unknown language to ru", () => {
    expect(resolveLanguage("de")).toBe("ru");
    expect(resolveLanguage(null)).toBe("ru");
    expect(resolveLanguage("en")).toBe("en");
  });
});
