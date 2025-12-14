/*
  Warnings:

  - A unique constraint covering the columns `[oficioId]` on the table `NotaAquisicao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `localInstalacao` to the `Oficio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade` to the `Oficio` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipoEquipamento` on the `Oficio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoEquipamento" AS ENUM ('SPLIT', 'CASSETE', 'MULTI_SPLIT', 'PORTATIL', 'JANELA', 'INVERTER', 'CENTRAL');

-- AlterTable
ALTER TABLE "NotaAquisicao" ADD COLUMN     "oficioId" TEXT;

-- AlterTable
ALTER TABLE "Oficio" ADD COLUMN     "localInstalacao" TEXT NOT NULL,
ADD COLUMN     "pdfAnexo" TEXT,
ADD COLUMN     "quantidade" INTEGER NOT NULL,
DROP COLUMN "tipoEquipamento",
ADD COLUMN     "tipoEquipamento" "TipoEquipamento" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NotaAquisicao_oficioId_key" ON "NotaAquisicao"("oficioId");

-- AddForeignKey
ALTER TABLE "NotaAquisicao" ADD CONSTRAINT "NotaAquisicao_oficioId_fkey" FOREIGN KEY ("oficioId") REFERENCES "Oficio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
