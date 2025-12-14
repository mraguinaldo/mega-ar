/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoNota } from '@prisma/client';

@Injectable()
export class NotaAquisicaoService {
  constructor(private prisma: PrismaService) {}

  async criarFromOficio(oficioId: string) {
    const oficio = await this.prisma.oficio.findUnique({
      where: { id: oficioId },
      include: { cliente: true },
    });

    if (!oficio) throw new NotFoundException('Ofício não encontrado');

    const existente = await this.prisma.notaAquisicao.findUnique({
      where: { oficioId },
    });

    if (existente) return existente;

    const catalogo = await this.prisma.catalogo.findFirst({
      where: { tipo: oficio.tipoEquipamento, ativo: true },
      orderBy: { preco: 'asc' },
    });

    return this.prisma.notaAquisicao.create({
      data: {
        clienteId: oficio.clienteId,
        catalogoId: catalogo ? catalogo.id : null,
        quantidade: oficio.quantidade,
        oficioId: oficio.id,
        estado: EstadoNota.EM_ANALISE,
      },
      include: {
        catalogo: { select: { nome: true, marca: true, preco: true } },
        cliente: { select: { nomeCompleto: true } },
        oficio: { select: { justificativa: true, localInstalacao: true } },
      },
    });
  }

  async aprovarNota(id: string, usuarioId: string) {
    const nota = await this.prisma.notaAquisicao.findUnique({
      where: { id },
      include: { oficio: true },
    });

    if (!nota?.oficio) throw new NotFoundException('Nota não encontrada');

    const catalogosDisponiveis = await this.prisma.catalogo.findMany({
      where: {
        tipo: nota.oficio.tipoEquipamento,
        ativo: true,
        stockAtual: { gte: nota.quantidade },
      },
      orderBy: { preco: 'asc' },
      take: 1,
    });

    if (catalogosDisponiveis.length === 0) {
      return this.prisma.notaAquisicao.update({
        where: { id },
        data: { estado: EstadoNota.AGUARDANDO_STOCK },
        include: { cliente: true, catalogo: true },
      });
    }

    const catalogoEscolhido = catalogosDisponiveis[0];

    await this.prisma.$transaction(async (tx) => {
      await tx.catalogo.update({
        where: { id: catalogoEscolhido.id },
        data: { stockAtual: { decrement: nota.quantidade } },
      });

      await tx.stockMovimento.create({
        data: {
          catalogoId: catalogoEscolhido.id,
          tipo: 'SAIDA',
          quantidade: nota.quantidade,
          motivo: `Aprovação automática - Nota #${id}`,
          notaAquisicaoId: id,
          criadoPorId: usuarioId,
        },
      });

      await tx.notaAquisicao.update({
        where: { id },
        data: {
          estado: EstadoNota.APROVADA,
          catalogoId: catalogoEscolhido.id,
        },
      });
    });

    return this.prisma.notaAquisicao.findUnique({
      where: { id },
      include: { cliente: true, catalogo: true },
    });
  }

  async rejeitarNota(id: string, motivoRecusa?: string) {
    const nota = await this.prisma.notaAquisicao.findUnique({ where: { id } });

    if (!nota) throw new NotFoundException('Nota não encontrada');

    if (nota.estado !== EstadoNota.EM_ANALISE)
      throw new BadRequestException('Nota já processada');

    return this.prisma.notaAquisicao.update({
      where: { id },
      data: {
        estado: EstadoNota.RECUSADA,
        motivoRecusa: motivoRecusa || 'Sem motivo informado',
      },
      include: {
        cliente: { select: { nomeCompleto: true } },
        catalogo: true,
      },
    });
  }

  async analisar(
    id: string,
    dto: { acao: 'APROVAR' | 'RECUSAR'; motivoRecusa?: string },
    usuarioId: string,
  ) {
    if (dto.acao === 'APROVAR') return this.aprovarNota(id, usuarioId);
    return this.rejeitarNota(id, dto.motivoRecusa);
  }

  async findAll() {
    return this.prisma.notaAquisicao.findMany({
      include: {
        cliente: { select: { nomeCompleto: true, contacto: true } },
        catalogo: {
          select: { nome: true, marca: true, modelo: true, preco: true },
        },
        oficio: { select: { justificativa: true, localInstalacao: true } },
      },
      orderBy: { dataCriacao: 'desc' },
    });
  }

  async findOne(id: string) {
    const nota = await this.prisma.notaAquisicao.findUnique({
      where: { id },
      include: {
        cliente: { select: { nomeCompleto: true, contacto: true } },
        catalogo: {
          select: {
            nome: true,
            marca: true,
            modelo: true,
            preco: true,
            imagens: true,
          },
        },
        oficio: { select: { justificativa: true, pdfAnexo: true } },
        pagamentos: true,
      },
    });

    if (!nota) throw new NotFoundException('Nota não encontrada');

    return nota;
  }

  async findByClienteUsuarioId(usuarioId: string) {
    return this.prisma.notaAquisicao.findMany({
      where: { clienteId: usuarioId },
      include: {
        catalogo: {
          select: {
            nome: true,
            marca: true,
            modelo: true,
            imagens: true,
            preco: true,
          },
        },
        oficio: { select: { pdfAnexo: true, justificativa: true } },
        pagamentos: {
          select: { valor: true, tipoPagamento: true, dataPagamento: true },
        },
      },
      orderBy: { dataCriacao: 'desc' },
    });
  }
}
