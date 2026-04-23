import { prisma } from "@/lib/prisma";
import { ActivityInput, ActivityUpdateInput } from "@/lib/validators/activity";

type SessionUser = {
  id: string;
  role: "user" | "admin";
};

export async function createActivity(input: ActivityInput, user: SessionUser) {
  return prisma.activity.create({
    data: {
      ...input,
      season: input.season || null,
      sourceActivityId: input.sourceActivityId ?? null,
      authorId: user.id
    }
  });
}

export async function listPublicActivities() {
  return prisma.activity.findMany({
    where: { isPublic: true },
    include: {
      author: {
        select: { id: true, name: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function listUserActivities(userId: string) {
  return prisma.activity.findMany({
    where: { authorId: userId },
    include: {
      author: {
        select: { id: true, name: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getActivityById(activityId: string, userId?: string) {
  return prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      author: {
        select: { id: true, name: true }
      },
      sourceActivity: {
        select: {
          id: true,
          title: true,
          author: { select: { name: true } }
        }
      },
      comments: {
        include: {
          author: { select: { id: true, name: true, role: true } }
        },
        orderBy: { createdAt: "asc" }
      },
      feedbackEntries: {
        include: {
          author: { select: { id: true, name: true, role: true } },
          media: true
        },
        orderBy: { createdAt: "desc" }
      },
      ratings: userId
        ? {
            where: { authorId: userId },
            select: { value: true }
          }
        : false
    }
  });
}

export function canManageActivity(user: SessionUser, activity: { authorId: string }) {
  if (user.role === "admin") {
    return true;
  }

  return user.id === activity.authorId;
}

export async function updateActivity(activityId: string, input: ActivityUpdateInput, user: SessionUser) {
  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, authorId: true }
  });

  if (!existing) {
    return { ok: false as const, status: 404, error: "Activity not found." };
  }

  if (!canManageActivity(user, existing)) {
    return { ok: false as const, status: 403, error: "You do not have permission to edit this activity." };
  }

  const updated = await prisma.activity.update({
    where: { id: activityId },
    data: {
      ...input,
      season: input.season || null,
      sourceActivityId: input.sourceActivityId ?? null
    }
  });

  return { ok: true as const, activity: updated };
}

export async function deleteActivity(activityId: string, user: SessionUser) {
  const existing = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { id: true, authorId: true }
  });

  if (!existing) {
    return { ok: false as const, status: 404, error: "Activity not found." };
  }

  if (!canManageActivity(user, existing)) {
    return { ok: false as const, status: 403, error: "You do not have permission to delete this activity." };
  }

  await prisma.activity.delete({ where: { id: activityId } });

  return { ok: true as const };
}
