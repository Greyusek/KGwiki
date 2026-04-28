-- Change plannedTime from timestamp to HH:MM string
ALTER TABLE "PlanItem"
  ALTER COLUMN "plannedTime" TYPE TEXT USING CASE
    WHEN "plannedTime" IS NULL THEN NULL
    ELSE to_char("plannedTime", 'HH24:MI')
  END;

-- Create week day nesting table
CREATE TABLE "WeekPlanDay" (
  "id" TEXT NOT NULL,
  "weekPlanId" TEXT NOT NULL,
  "dayIndex" INTEGER NOT NULL,
  "attachedDayPlanId" TEXT,
  "inlineDayPlanId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WeekPlanDay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WeekPlanDay_weekPlanId_dayIndex_key" ON "WeekPlanDay"("weekPlanId", "dayIndex");
CREATE INDEX "WeekPlanDay_attachedDayPlanId_idx" ON "WeekPlanDay"("attachedDayPlanId");
CREATE INDEX "WeekPlanDay_inlineDayPlanId_idx" ON "WeekPlanDay"("inlineDayPlanId");

ALTER TABLE "WeekPlanDay" ADD CONSTRAINT "WeekPlanDay_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeekPlanDay" ADD CONSTRAINT "WeekPlanDay_attachedDayPlanId_fkey" FOREIGN KEY ("attachedDayPlanId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WeekPlanDay" ADD CONSTRAINT "WeekPlanDay_inlineDayPlanId_fkey" FOREIGN KEY ("inlineDayPlanId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Compatibility migration: convert legacy week-plan items into inline day plans (one day slot per item)
DO $$
DECLARE
  week_plan RECORD;
  week_item RECORD;
  new_day_plan_id TEXT;
BEGIN
  FOR week_plan IN SELECT "id", "authorId", "weekStartDate", "createdAt", "updatedAt" FROM "Plan" WHERE "type" = 'week'
  LOOP
    FOR week_item IN
      SELECT * FROM "PlanItem" WHERE "planId" = week_plan."id" ORDER BY "orderIndex" ASC
    LOOP
      new_day_plan_id := concat('migrated_day_', substr(md5(random()::text || clock_timestamp()::text), 1, 24));

      INSERT INTO "Plan" ("id", "authorId", "type", "title", "date", "weekStartDate", "createdAt", "updatedAt")
      VALUES (
        new_day_plan_id,
        week_plan."authorId",
        'day',
        concat('Migrated Day ', week_item."orderIndex" + 1),
        COALESCE(week_plan."weekStartDate", week_plan."createdAt"),
        NULL,
        week_plan."createdAt",
        week_plan."updatedAt"
      );

      INSERT INTO "PlanItem" ("id", "planId", "activityId", "orderIndex", "plannedTime", "notes")
      VALUES (
        concat('migrated_item_', substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
        new_day_plan_id,
        week_item."activityId",
        0,
        week_item."plannedTime",
        week_item."notes"
      );

      INSERT INTO "WeekPlanDay" ("id", "weekPlanId", "dayIndex", "inlineDayPlanId", "createdAt", "updatedAt")
      VALUES (
        concat('migrated_week_day_', substr(md5(random()::text || clock_timestamp()::text), 1, 24)),
        week_plan."id",
        week_item."orderIndex",
        new_day_plan_id,
        week_plan."createdAt",
        week_plan."updatedAt"
      );
    END LOOP;

    DELETE FROM "PlanItem" WHERE "planId" = week_plan."id";
  END LOOP;
END
$$;
