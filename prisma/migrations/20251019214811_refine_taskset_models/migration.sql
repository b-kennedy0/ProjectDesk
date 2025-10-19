/*
  Warnings:

  - You are about to drop the column `durationDays` on the `TaskTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TaskTemplate` table. All the data in the column will be lost.
  - Added the required column `title` to the `TaskTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskTemplate" DROP COLUMN "durationDays",
DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dueOffset" INTEGER,
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL;
