import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { ALLOWED_MIME_TYPE_TO_MEDIA_TYPE, MATERIAL_MIME_LIMITS } from "@/lib/materials";
import { ensureMinioBucket, getMinioClient, minioBucket } from "@/lib/minio";
import { addFeedbackExternalLink, addFeedbackMedia } from "@/services/social-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { title?: string; externalUrl?: string; description?: string };
    if (!body.title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });
    if (!body.externalUrl || !/^https?:\/\//i.test(body.externalUrl)) return NextResponse.json({ error: "URL must start with http or https." }, { status: 400 });
    const result = await addFeedbackExternalLink(id, { title: body.title.trim(), externalUrl: body.externalUrl, description: body.description }, { id: session.user.id, role: session.user.role });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ data: result.media }, { status: 201 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File is required." }, { status: 400 });
  const mediaType = ALLOWED_MIME_TYPE_TO_MEDIA_TYPE[file.type];
  if (!mediaType || mediaType === "external_link") return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  if (file.size > MATERIAL_MIME_LIMITS[mediaType]) return NextResponse.json({ error: "File exceeds type size limit." }, { status: 400 });

  await ensureMinioBucket();
  const bytes = Buffer.from(await file.arrayBuffer());
  const objectPath = `feedback/${id}/${Date.now()}-${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await getMinioClient().putObject(minioBucket, objectPath, bytes, file.size, { "Content-Type": file.type });

  const result = await addFeedbackMedia(id, { fileName: file.name, objectPath, mimeType: file.type, fileSize: file.size }, { id: session.user.id, role: session.user.role });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ data: result.media }, { status: 201 });
}
