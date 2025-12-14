/*
  Warnings:

  - You are about to drop the column `disponibilidade` on the `Catalogo` table. All the data in the column will be lost.
  - You are about to drop the column `equipamento` on the `Catalogo` table. All the data in the column will be lost.
  - You are about to drop the column `equipamento` on the `NotaAquisicao` table. All the data in the column will be lost.
  - You are about to drop the column `quantidadeRetirada` on the `StockMovimento` table. All the data in the column will be lost.
  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Fornecedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `atualizadoEm` to the `Catalogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marca` to the `Catalogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelo` to the `Catalogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `Catalogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Catalogo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogoId` to the `NotaAquisicao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `justificativa` to the `Oficio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogoId` to the `StockMovimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `criadoPorId` to the `StockMovimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidade` to the `StockMovimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `StockMovimento` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoMovimento" AS ENUM ('ENTRADA', 'SAIDA');

-- AlterEnum
ALTER TYPE "Papel" ADD VALUE 'FORNECEDOR';

-- DropForeignKey
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Encomenda" DROP CONSTRAINT "Encomenda_fornecedorId_fkey";

-- DropForeignKey
ALTER TABLE "Fornecedor" DROP CONSTRAINT "Fornecedor_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "NotaAquisicao" DROP CONSTRAINT "NotaAquisicao_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Oficio" DROP CONSTRAINT "Oficio_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovimento" DROP CONSTRAINT "StockMovimento_notaAquisicaoId_fkey";

-- AlterTable
ALTER TABLE "Catalogo" DROP COLUMN "disponibilidade",
DROP COLUMN "equipamento",
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imagens" TEXT[],
ADD COLUMN     "marca" TEXT NOT NULL,
ADD COLUMN     "modelo" TEXT NOT NULL,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "stockAtual" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tipo" "TipoEquipamento" NOT NULL;

-- AlterTable
ALTER TABLE "NotaAquisicao" DROP COLUMN "equipamento",
ADD COLUMN     "catalogoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Oficio" ADD COLUMN     "justificativa" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StockMovimento" DROP COLUMN "quantidadeRetirada",
ADD COLUMN     "catalogoId" TEXT NOT NULL,
ADD COLUMN     "criadoPorId" TEXT NOT NULL,
ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "quantidade" INTEGER NOT NULL,
ADD COLUMN     "tipo" "TipoMovimento" NOT NULL,
ALTER COLUMN "notaAquisicaoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "identificacao" TEXT,
ADD COLUMN     "temCreditoEspecial" BOOLEAN DEFAULT false;

-- DropTable
DROP TABLE "Cliente";

-- DropTable
DROP TABLE "Fornecedor";

-- DropTable
DROP TABLE "Stock";

-- AddForeignKey
ALTER TABLE "StockMovimento" ADD CONSTRAINT "StockMovimento_catalogoId_fkey" FOREIGN KEY ("catalogoId") REFERENCES "Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovimento" ADD CONSTRAINT "StockMovimento_notaAquisicaoId_fkey" FOREIGN KEY ("notaAquisicaoId") REFERENCES "NotaAquisicao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovimento" ADD CONSTRAINT "StockMovimento_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oficio" ADD CONSTRAINT "Oficio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaAquisicao" ADD CONSTRAINT "NotaAquisicao_catalogoId_fkey" FOREIGN KEY ("catalogoId") REFERENCES "Catalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaAquisicao" ADD CONSTRAINT "NotaAquisicao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encomenda" ADD CONSTRAINT "Encomenda_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
