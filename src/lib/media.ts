import { minioBucket } from "@/lib/minio";

export function minioObjectPathFromUrl(url: string) {
  const prefix = `/media/${minioBucket}/`;
  if (!url.startsWith(prefix)) {
    return null;
  }

  const objectPath = url.slice(prefix.length);
  return objectPath.length ? objectPath : null;
}
