-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "catalogoId" TEXT;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "PagamentoToCatalogo" FOREIGN KEY ("catalogoId") REFERENCES "Catalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
