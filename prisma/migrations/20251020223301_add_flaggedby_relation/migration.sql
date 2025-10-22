-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "flaggedByUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_flaggedByUserId_fkey" FOREIGN KEY ("flaggedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
