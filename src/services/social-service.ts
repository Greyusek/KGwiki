import { ActivityMediaType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { minioObjectUrl } from "@/lib/minio";
import { CommentInput, FeedbackInput, RatingInput } from "@/lib/validators/social";

type SessionUser = {
  id: string;
  role: "user" | "admin";
};

function isAdmin(user: SessionUser) {
  return user.role === "admin";
}

export async function copyActivityToUser(activityId: string, user: SessionUser) {
  const source = await prisma.activity.findUnique({ where: { id: activityId } });

  if (!source) {
    return { ok: false as const, status: 404, error: "Activity not found." };
  }

  if (!source.isPublic && source.authorId !== user.id && !isAdmin(user)) {
    return { ok: false as const, status: 403, error: "This activity cannot be copied." };
  }

  const copied = await prisma.activity.create({
    data: {
      title: source.title,
      summary: source.summary,
      ageGroup: source.ageGroup,
      durationMinutes: source.durationMinutes,
      goal: source.goal,
      objectives: source.objectives,
      description: source.description,
      steps: source.steps,
      materialsNeeded: source.materialsNeeded,
      category: source.category,
      tags: source.tags,
      season: source.season,
      holidayLinks: source.holidayLinks,
      locationType: source.locationType,
      complexityLevel: source.complexityLevel,
      isPublic: false,
      authorId: user.id,
      sourceActivityId: source.id
    }
  });

  return { ok: true as const, activity: copied };
}

export async function addComment(activityId: string, input: CommentInput, user: SessionUser) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId }, select: { id: true, isPublic: true, authorId: true } });

  if (!activity) {
    return { ok: false as const, status: 404, error: "Activity not found." };
  }

  if (!activity.isPublic && activity.authorId !== user.id && !isAdmin(user)) {
    return { ok: false as const, status: 403, error: "You cannot comment on this activity." };
  }

  const comment = await prisma.comment.create({
    data: {
      activityId,
      authorId: user.id,
      content: input.content
    }
  });

  return { ok: true as const, comment };
}

export async function deleteComment(commentId: string, user: SessionUser) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true, authorId: true } });

  if (!comment) {
    return { ok: false as const, status: 404, error: "Comment not found." };
  }

  if (comment.authorId !== user.id && !isAdmin(user)) {
    return { ok: false as const, status: 403, error: "You cannot delete this comment." };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { ok: true as const };
}

async function recomputeAverage(activityId: string) {
  const aggregate = await prisma.rating.aggregate({
    where: { activityId },
    _avg: { value: true }
  });

  const average = aggregate._avg.value ?? 0;
  await prisma.activity.update({ where: { id: activityId }, data: { averageRating: average } });

  return average;
}

export async function upsertRating(activityId: string, input: RatingInput, user: SessionUser) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId }, select: { id: true, isPublic: true, authorId: true } });

  if (!activity) {
    return { ok: false as const, status: 404, error: "Activity not found." };
  }

  if (!activity.isPublic && activity.authorId !== user.id && !isAdmin(user)) {
    return { ok: false as const, status: 403, error: "You cannot rate this activity." };
  }

  const rating = await prisma.rating.upsert({
    where: {
      activityId_authorId: {
        activityId,
        authorId: user.id
      }
    },
    update: { value: input.value },
    create: {
      activityId,
      authorId: user.id,
      value: input.value
    }
  });

  const average = await recomputeAverage(activityId);

  return { ok: true as const, rating, average };
}

export async function createFeedback(activityId: string, input: FeedbackInput, user: SessionUser) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId }, select: { id: true, isPublic: true, authorId: true } });

  if (!activity) {
    return { ok: false as const, status: 404, error: "Activity not found." };
  }

  if (!activity.isPublic && activity.authorId !== user.id && !isAdmin(user)) {
    return { ok: false as const, status: 403, error: "You cannot add feedback for this activity." };
  }

  const feedback = await prisma.feedbackEntry.create({
    data: {
      activityId,
      authorId: user.id,
      summary: input.summary,
      whatWorked: input.whatWorked,
      whatToImprove: input.whatToImprove
    }
  });

  return { ok: true as const, feedback };
}

export async function updateFeedback(feedbackId: string, input: FeedbackInput, user: SessionUser) {
  const existing = await prisma.feedbackEntry.findUnique({ where: { id: feedbackId }, select: { id: true, authorId: true } });

  if (!existing) {
    return { ok: false as const, status: 404, error: "Feedback not found." };
  }

  if (existing.authorId !== user.id && !isAdmin(user)) {
    return { ok: false as const, status: 403, error: "You cannot edit this feedback." };
  }

  const feedback = await prisma.feedbackEntry.update({
    where: { id: feedbackId },
    data: input
  });

  return { ok: true as const, feedback };
}

export async function deleteFeedback(feedbackId: string, user: SessionUser) {
  const existing = await prisma.feedbackEntry.findUnique({ where: { id: feedbackId }, select: { id: true, authorId: true } });

  if (!existing) {
    return { ok: false as const, status: 404, error: "Feedback not found." };
  }

  if (existing.authorId !== user.id && !isAdmin(user)) {
    return { ok: false as const, status: 403, error: "You cannot delete this feedback." };
  }

  await prisma.feedbackEntry.delete({ where: { id: feedbackId } });
  return { ok: true as const };
}

export async function addFeedbackMedia(feedbackId: string, params: { fileName: string; objectPath: string; mimeType: string }, user: SessionUser) {
  const existing = await prisma.feedbackEntry.findUnique({
    where: { id: feedbackId },
    select: { id: true, authorId: true }
  });

  if (!existing) {
    return { ok: false as const, status: 404, error: "Feedback not found." };
  }

  if (existing.authorId !== user.id && !isAdmin(user)) {
    return { ok: false as const, status: 403, error: "You cannot upload files to this feedback." };
  }

  let type: ActivityMediaType = "document";
  if (params.mimeType.startsWith("image/")) {
    type = "image";
  } else if (params.mimeType.startsWith("video/")) {
    type = "video";
  }

  const media = await prisma.feedbackMedia.create({
    data: {
      feedbackEntryId: feedbackId,
      type,
      fileName: params.fileName,
      url: minioObjectUrl(params.objectPath)
    }
  });

  return { ok: true as const, media };
}
