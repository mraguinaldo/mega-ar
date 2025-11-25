/*
  Warnings:

  - A unique constraint covering the columns `[contacto]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Usuario_contacto_key" ON "Usuario"("contacto");
