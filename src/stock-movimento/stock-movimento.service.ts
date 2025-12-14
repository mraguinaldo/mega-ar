/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/stock-movimento/stock-movimento.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface FiltroMovimentoDto {
  catalogoId?: string;
  tipo?: 'ENTRADA' | 'SAIDA';
  dataInicio?: string;
  dataFim?: string;
}

@Injectable()
export class StockMovimentoService {
  constructor(private prisma: PrismaService) {}

  // 1. LISTAR TODOS OS MOVIMENTOS COM FILTRO
  async findAll(filtro?: FiltroMovimentoDto) {
    const where: any = {};

    if (filtro?.catalogoId) {
      where.catalogoId = filtro.catalogoId;
    }

    if (filtro?.tipo) {
      where.tipo = filtro.tipo;
    }

    if (filtro?.dataInicio || filtro?.dataFim) {
      where.dataMovimento = {};
      if (filtro.dataInicio) {
        where.dataMovimento.gte = new Date(filtro.dataInicio);
      }
      if (filtro.dataFim) {
        const fim = new Date(filtro.dataFim);
        fim.setHours(23, 59, 59, 999);
        where.dataMovimento.lte = fim;
      }
    }

    return this.prisma.stockMovimento.findMany({
      where,
      include: {
        catalogo: {
          select: {
            nome: true,
            marca: true,
            modelo: true,
            imagens: true,
          },
        },
        criadoPor: {
          select: {
            nomeCompleto: true,
            papel: true,
          },
        },
        notaAquisicao: {
          include: {
            cliente: {
              select: { nomeCompleto: true, contacto: true },
            },
          },
        },
      },
      orderBy: { dataMovimento: 'desc' },
    });
  }

  // 2. RESUMO POR EQUIPAMENTO (mais vendido)
  async porEquipamento() {
    const saidas = await this.prisma.stockMovimento.groupBy({
      by: ['catalogoId'],
      _sum: { quantidade: true },
      where: { tipo: 'SAIDA' },
    });

    const catalogos = await this.prisma.catalogo.findMany({
      where: {
        id: { in: saidas.map((s) => s.catalogoId) },
      },
      select: {
        id: true,
        nome: true,
        marca: true,
        modelo: true,
        stockAtual: true,
      },
    });

    return catalogos
      .map((catalogo) => {
        const movimento = saidas.find((s) => s.catalogoId === catalogo.id);
        return {
          id: catalogo.id,
          nome: catalogo.nome,
          marca: catalogo.marca,
          modelo: catalogo.modelo,
          totalVendido: movimento?._sum.quantidade || 0,
          stockAtual: catalogo.stockAtual,
        };
      })
      .sort((a, b) => b.totalVendido - a.totalVendido);
  }

  // 3. ÚLTIMOS 10 MOVIMENTOS
  async recentes() {
    return this.prisma.stockMovimento.findMany({
      take: 10,
      include: {
        catalogo: {
          select: { nome: true, marca: true, modelo: true },
        },
        criadoPor: {
          select: { nomeCompleto: true },
        },
      },
      orderBy: { dataMovimento: 'desc' },
    });
  }
}
