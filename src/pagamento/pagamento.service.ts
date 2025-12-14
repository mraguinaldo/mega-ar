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

  async registrarPagamento(
    notaId: string,
    valor: number,
    tipo: 'IMEDIATO' | 'PRESTACAO',
    usuarioId: string,
  ) {
    const nota = await this.prisma.notaAquisicao.findUnique({
      where: { id: notaId },
      include: { cliente: true, catalogo: true },
    });

    if (!nota) throw new NotFoundException('Nota não encontrada');
    if (nota.clienteId !== usuarioId) {
      throw new BadRequestException('Você só pode pagar suas próprias notas');
    }
    if (nota.estado !== EstadoNota.APROVADA) {
      throw new BadRequestException('Só pode pagar notas aprovadas');
    }

    return this.prisma.pagamento.create({
      data: {
        clienteId: nota.clienteId,
        notaAquisicaoId: notaId,
        valor,
        tipoPagamento: tipo,
      },
      include: {
        cliente: { select: { nomeCompleto: true } },
        notaAquisicao: {
          select: { catalogo: { select: { nome: true } }, estado: true },
        },
      },
    });
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
      },
      orderBy: { dataPagamento: 'desc' },
    });
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
}
