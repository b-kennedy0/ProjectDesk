-- AlterTable
ALTER TABLE "_ProjectCollaborators" ADD CONSTRAINT "_ProjectCollaborators_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_ProjectCollaborators_AB_unique";

-- AlterTable
ALTER TABLE "_ProjectStudents" ADD CONSTRAINT "_ProjectStudents_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_ProjectStudents_AB_unique";

-- CreateTable
CREATE TABLE "_TaskAssignments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TaskAssignments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskAssignments_B_index" ON "_TaskAssignments"("B");

-- AddForeignKey
ALTER TABLE "_TaskAssignments" ADD CONSTRAINT "_TaskAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignments" ADD CONSTRAINT "_TaskAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
