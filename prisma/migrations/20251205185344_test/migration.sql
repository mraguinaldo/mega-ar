/*
  Warnings:

  - The values [FORNECEDOR] on the enum `Papel` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cnpj` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `Encomenda` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Papel_new" AS ENUM ('CLIENTE', 'FUNCIONARIO', 'ADMIN');
ALTER TABLE "Usuario" ALTER COLUMN "papel" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "papel" TYPE "Papel_new" USING ("papel"::text::"Papel_new");
ALTER TYPE "Papel" RENAME TO "Papel_old";
ALTER TYPE "Papel_new" RENAME TO "Papel";
DROP TYPE "Papel_old";
ALTER TABLE "Usuario" ALTER COLUMN "papel" SET DEFAULT 'CLIENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Encomenda" DROP CONSTRAINT "Encomenda_fornecedorId_fkey";

-- DropForeignKey
ALTER TABLE "Encomenda" DROP CONSTRAINT "Encomenda_notaAquisicaoId_fkey";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "cnpj";

-- DropTable
DROP TABLE "Encomenda";

-- DropEnum
DROP TYPE "EstadoEncomenda";
