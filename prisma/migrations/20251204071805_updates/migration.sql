-- DropForeignKey
ALTER TABLE "NotaAquisicao" DROP CONSTRAINT "NotaAquisicao_catalogoId_fkey";

-- AlterTable
ALTER TABLE "NotaAquisicao" ALTER COLUMN "catalogoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "NotaAquisicao" ADD CONSTRAINT "NotaAquisicao_catalogoId_fkey" FOREIGN KEY ("catalogoId") REFERENCES "Catalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
