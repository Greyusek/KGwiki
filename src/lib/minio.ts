import { Client } from "minio";

const useSSL = process.env.MINIO_USE_SSL === "true";
const port = Number(process.env.MINIO_PORT ?? (useSSL ? 443 : 9000));
export const minioBucket = process.env.MINIO_BUCKET ?? "kgwiki-local";

let cachedClient: Client | null = null;

export function getMinioClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const endpoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error("MinIO environment variables are not fully configured.");
  }

  cachedClient = new Client({
    endPoint: endpoint,
    port,
    useSSL,
    accessKey,
    secretKey
  });

  return cachedClient;
}

let initPromise: Promise<void> | null = null;

export function ensureMinioBucket() {
  if (!initPromise) {
    initPromise = (async () => {
      const minioClient = getMinioClient();
      const exists = await minioClient.bucketExists(minioBucket);
      if (!exists) {
        await minioClient.makeBucket(minioBucket, "us-east-1");
      }
    })();
  }

  return initPromise;
}

export function minioObjectUrl(objectPath: string) {
  return `/media/${minioBucket}/${objectPath}`;
}
