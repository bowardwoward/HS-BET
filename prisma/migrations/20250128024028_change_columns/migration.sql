/*
  Warnings:

  - Made the column `description` on table `TransferToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TransferToken" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT 'Transfer';
