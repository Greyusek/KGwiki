import { ActivityMediaType } from "@prisma/client";

export const MATERIAL_MIME_LIMITS: Record<ActivityMediaType, number> = {
  image: 20 * 1024 * 1024,
  audio: 200 * 1024 * 1024,
  video: 1024 * 1024 * 1024,
  document: 100 * 1024 * 1024,
  external_link: 0
};

export const ALLOWED_MIME_TYPE_TO_MEDIA_TYPE: Record<string, ActivityMediaType> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "audio/mpeg": "audio",
  "audio/mp3": "audio",
  "audio/wav": "audio",
  "audio/ogg": "audio",
  "audio/webm": "audio",
  "audio/mp4": "audio",
  "application/pdf": "document",
  "text/plain": "document",
  "application/msword": "document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "document",
  "application/vnd.ms-excel": "document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "document",
  "application/vnd.ms-powerpoint": "document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "document"
};

export function detectLinkProvider(url: string) {
  const host = new URL(url).hostname.toLowerCase();
  if (host.includes("dropbox")) return "Dropbox";
  if (host.includes("disk.yandex") || host.includes("yadi.sk")) return "Yandex Disk";
  if (host.includes("drive.google")) return "Google Drive";
  if (host.includes("onedrive") || host.includes("1drv.ms")) return "OneDrive";
  return "External link";
}
