import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { ensureMinioBucket, getMinioClient, minioBucket } from "@/lib/minio";
import { addFeedbackMedia } from "@/services/social-service";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain"
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 10MB." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  await ensureMinioBucket();

  const { id } = await params;
  const bytes = Buffer.from(await file.arrayBuffer());
  const objectPath = `feedback/${id}/${Date.now()}-${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  await getMinioClient().putObject(minioBucket, objectPath, bytes, file.size, {
    "Content-Type": file.type
  });

  const result = await addFeedbackMedia(
    id,
    { fileName: file.name, objectPath, mimeType: file.type },
    { id: session.user.id, role: session.user.role }
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ data: { id: result.media.id, url: result.media.url } }, { status: 201 });
}
