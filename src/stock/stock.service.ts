/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prefer-const */
// src/catalogo/catalogo.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCatalogoDto } from './dto/create-stock.dto';

import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { NotaAquisicaoService } from 'src/nota-aquisicao/nota-aquisicao.service';

@Injectable()
export class CatalogoService {
  constructor(
    private prisma: PrismaService,
    private notaAquisicao: NotaAquisicaoService,
  ) {}

  async findAllPublic() {
    return this.prisma.catalogo.findMany({
      where: { ativo: true },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        nome: true,
        marca: true,
        modelo: true,
        descricao: true,
        preco: true,
        imagens: true,
        tipo: true,
        stockAtual: true,
      },
    });
  }

  async findAll() {
    return this.prisma.catalogo.findMany({
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        nome: true,
        marca: true,
        modelo: true,
        descricao: true,
        preco: true,
        imagens: true,
        tipo: true,
        stockAtual: true,
        ativo: true,
      },
    });
  }

  async create(dto: CreateCatalogoDto & { imagens?: Express.Multer.File[] }) {
    let imagensPaths: string[] = [];

    if (dto.imagens && dto.imagens.length > 0) {
      const nomeProduto = dto.nome.replace(/\s+/g, '_').toUpperCase();
      const uploadDir = join(process.cwd(), 'uploads', 'catalogo', nomeProduto);
      await mkdir(uploadDir, { recursive: true });

      for (const file of dto.imagens) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, file.buffer);
        imagensPaths.push(`/uploads/catalogo/${nomeProduto}/${fileName}`);
      }
    }

    return this.prisma.catalogo.create({
      data: {
        nome: dto?.nome,
        marca: dto?.marca,
        modelo: dto?.modelo,
        descricao: dto?.descricao,
        preco: dto?.preco,
        tipo: dto.tipo,
        imagens: imagensPaths,
        ativo: true,
        stockAtual: 0,
      },
    });
  }

  async update(
    id: string,
    dto: Partial<CreateCatalogoDto & { imagens?: Express.Multer.File[] }>,
  ) {
    let imagensPaths: string[] = [];

    const produtoAtual = await this.prisma.catalogo.findUnique({
      where: { id },
      select: { nome: true, imagens: true },
    });

    if (!produtoAtual) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (dto.imagens && dto.imagens.length > 0) {
      const nomeParaPasta = (dto.nome || produtoAtual.nome)
        .replace(/\s+/g, '_')
        .toUpperCase();
      const uploadDir = join(
        process.cwd(),
        'uploads',
        'catalogo',
        nomeParaPasta,
      );
      await mkdir(uploadDir, { recursive: true });

      for (const file of dto.imagens) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, file.buffer);

        imagensPaths.push(`/uploads/catalogo/${nomeParaPasta}/${fileName}`);
      }
    }

    const dataToUpdate: any = {
      ...(dto.nome && { nome: dto.nome }),
      ...(dto.marca && { marca: dto.marca }),
      ...(dto.modelo && { modelo: dto.modelo }),
      ...(dto.descricao && { descricao: dto.descricao }),
      ...(dto.preco !== undefined && { preco: dto.preco }),
      ...(dto.tipo && { tipo: dto.tipo }),
      ...(dto.stockAtual !== undefined && { stockAtual: dto.stockAtual }),
      ...(dto.ativo !== undefined && { ativo: dto.ativo }),
    };

    if (imagensPaths.length > 0) {
      dataToUpdate.imagens = imagensPaths;
    }

    return this.prisma.catalogo.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async deactivate(id: string) {
    const catalogo = await this.prisma.catalogo.findUnique({ where: { id } });
    if (!catalogo) throw new NotFoundException('Produto não encontrado');
    return this.prisma.catalogo.update({
      where: { id },
      data: { ativo: false },
    });
  }

  async ativar(id: string) {
    const catalogo = await this.prisma.catalogo.findUnique({ where: { id } });
    if (!catalogo) throw new NotFoundException('Produto não encontrado');
    return this.prisma.catalogo.update({
      where: { id },
      data: { ativo: true },
    });
  }

  async adicionarEntrada(
    catalogoId: string,
    quantidade: number,
    usuarioId: string,
    motivo = 'Entrada manual',
  ) {
    const catalogo = await this.prisma.catalogo.findUnique({
      where: { id: catalogoId },
    });
    if (!catalogo) throw new NotFoundException('Equipamento não encontrado');

    await this.prisma.catalogo.update({
      where: { id: catalogoId },
      data: { stockAtual: { increment: quantidade } },
    });

    return this.prisma.stockMovimento.create({
      data: {
        catalogoId,
        tipo: 'ENTRADA',
        quantidade,
        motivo,
        criadoPorId: usuarioId,
      },
    });
  }

  async retirarStock(
    catalogoId: string,
    quantidade: number,
    notaAquisicaoId: string,
    usuarioId: string,
  ) {
    const catalogo = await this.prisma.catalogo.findUnique({
      where: { id: catalogoId },
    });
    if (!catalogo) throw new NotFoundException('Equipamento não encontrado');
    if (catalogo.stockAtual < quantidade) {
      throw new BadRequestException(
        `Stock insuficiente: apenas ${catalogo.stockAtual} disponível`,
      );
    }

    const nota = await this.prisma.stockMovimento.findFirst({
      where: { notaAquisicaoId, catalogoId, tipo: 'SAIDA' },
    });

    if (nota) {
      throw new BadRequestException(
        'Stock já retirado para esta nota de aquisição e catálogo',
      );
    }

    return await this.notaAquisicao.aprovarNota(notaAquisicaoId, usuarioId);
  }

  async getMovimentos() {
    return this.prisma.stockMovimento.findMany({
      include: {
        catalogo: { select: { nome: true, marca: true, modelo: true } },
        criadoPor: { select: { nomeCompleto: true, papel: true } },
        notaAquisicao: {
          select: { id: true, cliente: { select: { nomeCompleto: true } } },
        },
      },
      orderBy: { dataMovimento: 'desc' },
    });
  }

  async getById(id: string) {
    const catalogo = await this.prisma.catalogo.findUnique({
      where: { id },
    });
    if (!catalogo) throw new NotFoundException('Produto não encontrado');
    return catalogo;
  }
}
