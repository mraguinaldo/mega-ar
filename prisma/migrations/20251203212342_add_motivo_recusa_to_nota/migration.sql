/*
  Warnings:

  - Made the column `quantidade` on table `NotaAquisicao` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "NotaAquisicao" ALTER COLUMN "quantidade" SET NOT NULL;
