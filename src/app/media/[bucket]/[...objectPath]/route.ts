import { NextResponse } from "next/server";

import { getMinioClient, minioBucket } from "@/lib/minio";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bucket: string; objectPath: string[] }> }
) {
  const { bucket, objectPath } = await params;

  if (bucket !== minioBucket || !objectPath?.length) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const objectName = objectPath.join("/");
  const stat = await getMinioClient().statObject(bucket, objectName).catch(() => null);
  if (!stat) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const stream = await getMinioClient().getObject(bucket, objectName).catch(() => null);
  if (!stream) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const contentType = stat.metaData["content-type"] ?? "application/octet-stream";
  const isInline = contentType.startsWith("image/") || contentType.startsWith("video/") || contentType.startsWith("audio/") || contentType === "application/pdf" || contentType.startsWith("text/");
  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Content-Disposition": `${isInline ? "inline" : "attachment"}; filename=\"${encodeURIComponent(objectPath[objectPath.length - 1])}\"`,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
