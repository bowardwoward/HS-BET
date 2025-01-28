-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "TransferToken" (
    "id" TEXT NOT NULL,
    "hashedOtp" TEXT NOT NULL,
    "sourceAccountNumber" TEXT NOT NULL,
    "destinationAccountNumber" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,

    CONSTRAINT "TransferToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TransferToken" ADD CONSTRAINT "TransferToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
