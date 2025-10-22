-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "emailVerified" TIMESTAMP(3),
  ADD COLUMN "pendingEmail" TEXT;

-- CreateTable
CREATE TABLE "EmailVerification" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "newEmail" TEXT,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailVerification_token_key" UNIQUE ("token"),
  CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EmailVerification_userId_idx" ON "EmailVerification"("userId");
