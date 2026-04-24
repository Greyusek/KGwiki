import { beforeEach, describe, expect, it, vi } from "vitest";

describe("activity and feedback media routes", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("upload file to activity", async () => {
    const putObject = vi.fn(async () => undefined);
    const addActivityMedia = vi.fn(async () => ({ ok: true as const, media: { id: "m1", url: "/media/kgwiki-local/activities/a1/demo.png" } }));

    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/lib/minio", () => ({
      ensureMinioBucket: async () => undefined,
      getMinioClient: () => ({ putObject }),
      minioBucket: "kgwiki-local"
    }));
    vi.doMock("@/services/activity-service", () => ({ addActivityMedia }));

    const { POST } = await import("./activities/[id]/media/route");
    const form = new FormData();
    form.append("file", new File(["hello"], "demo.png", { type: "image/png" }));

    const response = await POST(new Request("http://localhost/api/activities/a1/media", { method: "POST", body: form }), {
      params: Promise.resolve({ id: "a1" })
    });
    expect(response.status).toBe(201);
    expect(putObject).toHaveBeenCalledTimes(1);
    expect(addActivityMedia).toHaveBeenCalledTimes(1);
  });

  it("upload feedback attachment", async () => {
    const putObject = vi.fn(async () => undefined);
    const addFeedbackMedia = vi.fn(async () => ({ ok: true as const, media: { id: "fm1", url: "/media/kgwiki-local/feedback/f1/note.txt" } }));

    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/lib/minio", () => ({
      ensureMinioBucket: async () => undefined,
      getMinioClient: () => ({ putObject }),
      minioBucket: "kgwiki-local"
    }));
    vi.doMock("@/services/social-service", () => ({ addFeedbackMedia }));

    const { POST } = await import("./feedback/[id]/media/route");
    const form = new FormData();
    form.append("file", new File(["hello"], "note.txt", { type: "text/plain" }));

    const response = await POST(new Request("http://localhost/api/feedback/f1/media", { method: "POST", body: form }), {
      params: Promise.resolve({ id: "f1" })
    });
    expect(response.status).toBe(201);
    expect(putObject).toHaveBeenCalledTimes(1);
    expect(addFeedbackMedia).toHaveBeenCalledTimes(1);
  });

  it("delete uploaded file metadata endpoint", async () => {
    const removeActivityMedia = vi.fn(async () => ({ ok: true as const }));
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    vi.doMock("@/services/activity-service", () => ({ removeActivityMedia }));

    const { DELETE } = await import("./activities/[id]/media/[mediaId]/route");
    const response = await DELETE(new Request("http://localhost/api/activities/a1/media/m1", { method: "DELETE" }), {
      params: Promise.resolve({ id: "a1", mediaId: "m1" })
    });
    expect(response.status).toBe(200);
    expect(removeActivityMedia).toHaveBeenCalledTimes(1);
  });
});
