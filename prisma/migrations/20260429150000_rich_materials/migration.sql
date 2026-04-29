-- AlterEnum
ALTER TYPE "ActivityMediaType" ADD VALUE IF NOT EXISTS 'audio';
ALTER TYPE "ActivityMediaType" ADD VALUE IF NOT EXISTS 'external_link';

-- AlterTable
ALTER TABLE "ActivityMedia"
ADD COLUMN "description" TEXT,
ADD COLUMN "externalUrl" TEXT,
ADD COLUMN "fileSize" INTEGER,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "title" TEXT;

-- AlterTable
ALTER TABLE "FeedbackMedia"
ADD COLUMN "description" TEXT,
ADD COLUMN "externalUrl" TEXT,
ADD COLUMN "fileSize" INTEGER,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "title" TEXT;
