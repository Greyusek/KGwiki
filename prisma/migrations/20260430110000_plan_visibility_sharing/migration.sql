-- CreateEnum
CREATE TYPE "PlanVisibility" AS ENUM ('private', 'public', 'shared');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "visibility" "PlanVisibility" NOT NULL DEFAULT 'private';

-- CreateTable
CREATE TABLE "PlanShare" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Plan_visibility_idx" ON "Plan"("visibility");

-- CreateIndex
CREATE UNIQUE INDEX "PlanShare_planId_userId_key" ON "PlanShare"("planId", "userId");

-- CreateIndex
CREATE INDEX "PlanShare_userId_idx" ON "PlanShare"("userId");

-- AddForeignKey
ALTER TABLE "PlanShare" ADD CONSTRAINT "PlanShare_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanShare" ADD CONSTRAINT "PlanShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
