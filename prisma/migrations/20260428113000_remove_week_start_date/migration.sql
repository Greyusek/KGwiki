-- Remove date dependency from week plans
DROP INDEX IF EXISTS "Plan_weekStartDate_idx";
ALTER TABLE "Plan" DROP COLUMN IF EXISTS "weekStartDate";
