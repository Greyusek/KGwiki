import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn()
    }
  }
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

describe("user search route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns matching users by name and email with minimal fields", async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: "u2", name: "Alice", email: "alice@example.com" }]);
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/users/search?q=ali"));
    const body = await response.json() as { data: Array<{ id: string; name: string; email: string; passwordHash?: string }> };

    expect(response.status).toBe(200);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        AND: expect.arrayContaining([
          expect.objectContaining({ id: { not: "u1" } }),
          expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: "ali", mode: "insensitive" } },
              { email: { contains: "ali", mode: "insensitive" } }
            ])
          })
        ])
      }),
      select: { id: true, name: true, email: true }
    }));
    expect(body.data[0]).not.toHaveProperty("passwordHash");
  });

  it("returns empty list for short query", async () => {
    vi.doMock("@/lib/auth", () => ({ auth: async () => ({ user: { id: "u1", role: "user" } }) }));
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost/api/users/search?q=a"));

    expect(response.status).toBe(200);
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });
});
