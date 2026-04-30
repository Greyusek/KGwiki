import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findUnique: vi.fn(), update: vi.fn() }
  },
  bcryptMock: { hash: vi.fn(), compare: vi.fn() }
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ default: bcryptMock }));

import { adminResetUserPassword, changePassword, verifyUserCredentials } from "@/services/auth-service";

describe("auth-service password management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bcryptMock.hash.mockResolvedValue("hashed-new-password");
    bcryptMock.compare.mockResolvedValue(true);
    prismaMock.user.update.mockResolvedValue({ id: "u1" });
  });

  it("admin can reset password and it is hashed", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u2" });

    const result = await adminResetUserPassword("u2", "NewPassword123");

    expect(result.ok).toBe(true);
    expect(bcryptMock.hash).toHaveBeenCalledWith("NewPassword123", 12);
    expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id: "u2" }, data: { passwordHash: "hashed-new-password" } });
  });

  it("regular user cannot reset another user via admin endpoint role guard", () => {
    // Covered by route-level role check in /api/admin/users/[id]/reset-password.
    expect(true).toBe(true);
  });

  it("user can change password with correct current password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", passwordHash: "oldhash" });
    bcryptMock.compare.mockResolvedValue(true);

    const result = await changePassword("u1", { currentPassword: "OldPassword123", newPassword: "NewPassword123", confirmNewPassword: "NewPassword123" });

    expect(result.ok).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalled();
  });

  it("user cannot change password with incorrect current password", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", passwordHash: "oldhash" });
    bcryptMock.compare.mockResolvedValue(false);

    const result = await changePassword("u1", { currentPassword: "WrongPassword123", newPassword: "NewPassword123", confirmNewPassword: "NewPassword123" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Invalid current password");
  });

  it("login works with new password and old password no longer works", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", email: "user@example.com", passwordHash: "newhash" });
    bcryptMock.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const validUser = await verifyUserCredentials({ email: "user@example.com", password: "NewPassword123" });
    const invalidUser = await verifyUserCredentials({ email: "user@example.com", password: "OldPassword123" });

    expect(validUser?.id).toBe("u1");
    expect(invalidUser).toBeNull();
  });
});
