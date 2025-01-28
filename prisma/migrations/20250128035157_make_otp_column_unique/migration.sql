/*
  Warnings:

  - A unique constraint covering the columns `[otp]` on the table `TransferToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TransferToken_otp_key" ON "TransferToken"("otp");
