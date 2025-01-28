/*
  Warnings:

  - Added the required column `otp` to the `TransferToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TransferToken" ADD COLUMN     "otp" TEXT NOT NULL;
