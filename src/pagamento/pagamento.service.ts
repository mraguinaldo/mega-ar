/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoNota } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PagamentoService {
  constructor(private prisma: PrismaService) {}

  async registrarPagamentoNormal(
    notaId: string,
    valor: number,
    tipo: 'IMEDIATO' | 'PRESTACAO',
    usuarioId: string,
  ) {
    const nota = await this.prisma.notaAquisicao.findUnique({
      where: { id: notaId },
      include: { cliente: true, catalogo: true, pagamentos: true },
    });

    if (!nota) throw new NotFoundException('Nota não encontrada');
    // if (nota.clienteId !== usuarioId)
    //   throw new BadRequestException('Você só pode pagar suas próprias notas');
    if (!nota.catalogo)
      throw new BadRequestException('Nota não tem produto associado');

    const totalNota = nota.catalogo.preco * nota.quantidade;
    const totalPago = nota.pagamentos.reduce((acc, p) => acc + p.valor, 0);

    if (valor <= 0) throw new BadRequestException('Valor deve ser positivo');

    let restante = totalNota - totalPago;
    let excedente = 0;
    if (valor > restante) {
      excedente = valor - restante;
      valor = restante;
    }

    // Cria pagamento normal
    await this.prisma.pagamento.create({
      data: {
        clienteId: nota.clienteId,
        notaAquisicaoId: notaId,
        catalogoId: nota.catalogo.id,
        valor,
        tipoPagamento: tipo,
      },
    });

    if (excedente > 0) {
      await this.prisma.usuario.update({
        where: { id: nota.clienteId },
        data: {
          creditoAcumulado: { increment: excedente },
          temCreditoEspecial: true,
        },
      });
    }

    restante -= valor;

    const novoEstado =
      restante <= 0 ? EstadoNota.CONCLUIDA : EstadoNota.PAGAMENTO_PENDENTE;

    await this.prisma.notaAquisicao.update({
      where: { id: notaId },
      data: { estado: novoEstado, valorEmFalta: restante },
    });

    return {
      mensagem: 'Pagamento registrado',
      valorEmFalta: restante,
      excedente,
    };
  }

  async porNotaAquisicao(notaId: string) {
    return this.prisma.pagamento.findMany({
      where: { notaAquisicaoId: notaId },
      orderBy: { dataPagamento: 'desc' },
    });
  }

  async meusPagamentos(usuarioId: string) {
    const cliente = await this.prisma.usuario.findUnique({
      where: { id: usuarioId, papel: 'CLIENTE' },
    });

    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    return this.prisma.pagamento.findMany({
      where: { clienteId: cliente.id },
      include: {
        notaAquisicao: true,
        catalogo: true,
        cliente: true,
      },
      orderBy: { dataPagamento: 'desc' },
    });
  }

  async pagarComCreditoEspecial(notaId: string, usuarioId: string) {
    const nota = await this.prisma.notaAquisicao.findUnique({
      where: { id: notaId },
      include: { cliente: true, catalogo: true, pagamentos: true },
    });

    if (!nota) throw new NotFoundException('Nota não encontrada');
    // if (nota.clienteId !== usuarioId)
    //   throw new BadRequestException('Você só pode pagar suas próprias notas');

    if (!nota.catalogo)
      throw new BadRequestException('Nota não tem produto associado');

    const cliente = nota.cliente;
    if (!cliente.temCreditoEspecial || cliente.creditoAcumulado <= 0) {
      throw new BadRequestException('Crédito especial insuficiente');
    }

    const totalNota = nota.catalogo.preco * nota.quantidade;
    const totalPago = nota.pagamentos.reduce((acc, p) => acc + p.valor, 0);

    let restante = totalNota - totalPago;
    const usarCredito = Math.min(cliente.creditoAcumulado, restante);

    await this.prisma.usuario.update({
      where: { id: cliente.id },
      data: { creditoAcumulado: cliente.creditoAcumulado - usarCredito },
    });

    restante -= usarCredito;

    const novoEstado =
      restante <= 0 ? EstadoNota.CONCLUIDA : EstadoNota.PAGAMENTO_PENDENTE;

    await this.prisma.notaAquisicao.update({
      where: { id: notaId },
      data: { estado: novoEstado, valorEmFalta: restante },
    });

    return {
      mensagem: 'Pagamento realizado com crédito especial',
      valorUsado: usarCredito,
      valorEmFalta: restante,
      estadoNota: novoEstado,
    };
  }

  async totalHoje() {
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const fimDoDia = new Date();
    fimDoDia.setHours(23, 59, 59, 999);

    const resultado = await this.prisma.pagamento.aggregate({
      where: {
        dataPagamento: { gte: inicioDoDia, lte: fimDoDia },
      },
      _sum: { valor: true },
      _count: { id: true },
    });

    return {
      totalArrecadado: resultado._sum.valor || 0,
      totalPagamentos: resultado._count.id,
      data: new Date().toLocaleDateString('pt-AO'),
    };
  }

  async todosPagamentos() {
    return this.prisma.pagamento.findMany({
      include: {
        cliente: {
          select: {
            nomeCompleto: true,
            email: true,
          },
        },
        notaAquisicao: {
          select: {
            id: true,
            catalogo: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        dataPagamento: 'desc',
      },
    });
  }

  async adicionarCreditoEspecial(usuarioId: string, valor: number) {
    if (valor <= 0) throw new BadRequestException('Valor deve ser positivo');

    const usuario = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        creditoAcumulado: { increment: valor },
        temCreditoEspecial: true,
      },
    });

    return {
      mensagem: 'Crédito especial adicionado',
      creditoAtual: usuario.creditoAcumulado,
    };
  }
}
