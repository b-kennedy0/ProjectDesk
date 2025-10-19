/*
  Warnings:

  - You are about to drop the column `title` on the `TaskSet` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `TaskTemplate` table. All the data in the column will be lost.
  - Added the required column `name` to the `TaskSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `TaskTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskSet" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaskTemplate" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;
