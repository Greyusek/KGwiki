import { describe, expect, it, vi } from "vitest";

const { authMock, resetMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  resetMock: vi.fn()
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/services/auth-service", () => ({ adminResetUserPassword: resetMock }));

import { POST } from "@/app/api/admin/users/[id]/reset-password/route";

describe("admin reset password route", () => {
  it("rejects non-admin users", async () => {
    authMock.mockResolvedValue({ user: { id: "u1", role: "user" } });

    const request = new Request("http://localhost/api/admin/users/u2/reset-password", {
      method: "POST",
      body: JSON.stringify({ newPassword: "NewPassword123", confirmPassword: "NewPassword123" })
    });

    const response = await POST(request, { params: Promise.resolve({ id: "u2" }) });

    expect(response.status).toBe(403);
    expect(resetMock).not.toHaveBeenCalled();
  });
});
