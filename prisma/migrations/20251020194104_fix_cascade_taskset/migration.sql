/*
  Warnings:

  - You are about to drop the column `description` on the `TaskSet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TaskTemplate" DROP CONSTRAINT "TaskTemplate_taskSetId_fkey";

-- AlterTable
ALTER TABLE "TaskSet" DROP COLUMN "description";

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_taskSetId_fkey" FOREIGN KEY ("taskSetId") REFERENCES "TaskSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
