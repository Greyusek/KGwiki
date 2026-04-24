import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("media open route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("open activity and feedback attachments", async () => {
    vi.doMock("@/lib/minio", () => ({
      minioBucket: "kgwiki-local",
      getMinioClient: () => ({
        statObject: async () => ({ size: 5, metaData: { "content-type": "text/plain" } }),
        getObject: async () => Readable.from([Buffer.from("hello")])
      })
    }));

    const { GET } = await import("./[bucket]/[...objectPath]/route");
    const activityResponse = await GET(new Request("http://localhost/media/kgwiki-local/activities/a1/file.txt"), {
      params: Promise.resolve({ bucket: "kgwiki-local", objectPath: ["activities", "a1", "file.txt"] })
    });
    const feedbackResponse = await GET(new Request("http://localhost/media/kgwiki-local/feedback/f1/file.txt"), {
      params: Promise.resolve({ bucket: "kgwiki-local", objectPath: ["feedback", "f1", "file.txt"] })
    });

    expect(activityResponse.status).toBe(200);
    expect(feedbackResponse.status).toBe(200);
    expect(await activityResponse.text()).toBe("hello");
    expect(await feedbackResponse.text()).toBe("hello");
  });
});
