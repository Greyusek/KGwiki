import { beforeEach, describe, expect, it, vi } from "vitest";

describe("activity and feedback media routes", () => {
  beforeEach(() => vi.resetModules());

  it("upload image and video and audio and document", async () => {
    const putObject = vi.fn(async () => undefined);
    const addActivityMedia = vi.fn(async () => ({ ok: true as const, media: { id: "m1", url: "/media/kgwiki-local/activities/a1/file" } }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/lib/minio", () => ({ ensureMinioBucket: async () => undefined, getMinioClient: () => ({ putObject }), minioBucket: "kgwiki-local" }));
    vi.doMock("@/services/activity-service", () => ({ addActivityMedia, addActivityExternalLink: vi.fn() }));
    const { POST } = await import("./activities/[id]/media/route");

    for (const [type, name] of [["image/png", "a.png"], ["video/mp4", "a.mp4"], ["audio/mpeg", "a.mp3"], ["application/pdf", "a.pdf"]]) {
      const form = new FormData(); form.append("file", new File(["hello"], name, { type }));
      const response = await POST(new Request("http://localhost/api/activities/a1/media", { method: "POST", body: form }), { params: Promise.resolve({ id: "a1" }) });
      expect(response.status).toBe(201);
    }
    expect(putObject).toHaveBeenCalledTimes(4);
    expect(addActivityMedia).toHaveBeenCalledTimes(4);
  });

  it("add external link material", async () => {
    const addActivityExternalLink = vi.fn(async () => ({ ok: true as const, media: { id: "m2" } }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/activity-service", () => ({ addActivityExternalLink, addActivityMedia: vi.fn() }));
    const { POST } = await import("./activities/[id]/media/route");
    const response = await POST(new Request("http://localhost/api/activities/a1/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Drive", externalUrl: "https://drive.google.com/x" }) }), { params: Promise.resolve({ id: "a1" }) });
    expect(response.status).toBe(201);
  });
});
