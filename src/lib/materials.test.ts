import { describe, expect, it, vi } from "vitest";

import { getLinkProvider, safeParseUrl } from "@/lib/materials";

describe("safeParseUrl", () => {
  it("parses relative uploaded media URLs on client", () => {
    vi.stubGlobal("window", {
      location: { origin: "https://example.test" }
    } as Window & typeof globalThis);

    const parsed = safeParseUrl("/media/activity-media/test.jpg");

    expect(parsed?.href).toBe("https://example.test/media/activity-media/test.jpg");

    vi.unstubAllGlobals();
  });

  it("returns null for invalid URLs", () => {
    expect(safeParseUrl("://bad")).toBeNull();
  });
});

describe("getLinkProvider", () => {
  it("returns provider for known external URLs", () => {
    expect(getLinkProvider("https://disk.yandex.ru/some/path")).toBe("Yandex Disk");
  });

  it("does not treat internal media links as cloud providers", () => {
    vi.stubGlobal("window", {
      location: { origin: "https://example.test" }
    } as Window & typeof globalThis);

    expect(getLinkProvider("/media/activity-media/test.jpg")).toBe("External link");

    vi.unstubAllGlobals();
  });
});
