import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOficioDto } from './dto/create-oficio.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { NotaAquisicaoService } from 'src/nota-aquisicao/nota-aquisicao.service';

@Injectable()
export class OficiosService {
  constructor(
    private prisma: PrismaService,
    private notaAquisicao: NotaAquisicaoService,
  ) {}

  async create(
    dto: CreateOficioDto,
    usuarioId: string,
    file?: Express.Multer.File,
  ) {
    const cliente = await this.prisma.usuario.findUnique({
      where: { id: usuarioId, papel: 'CLIENTE' },
    });

    if (!cliente) {
      throw new BadRequestException('Apenas clientes podem enviar ofícios');
    }

    let pdfPath: string | null = null;

    if (file) {
      const uploadDir = join(process.cwd(), 'uploads', 'oficios');
      await mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.originalname}`;
      pdfPath = join(uploadDir, fileName);

      await writeFile(pdfPath, file.buffer);
      pdfPath = `/uploads/oficios/${fileName}`;
    }

    const oficio = await this.prisma.oficio.create({
      data: {
        descricao: dto.descricao,
        tipoEquipamento: dto.tipoEquipamento,
        quantidade: Number(dto.quantidade),
        localInstalacao: dto.localInstalacao,
        justificativa: dto.justificativa as string,
        pdfAnexo: pdfPath,
        clienteId: cliente.id,
      },
      include: {
        cliente: {
          select: {
            nomeCompleto: true,
            email: true,
            activo: true,
            papel: true,
            temCreditoEspecial: true,
            StockMovimento: true,
          },
        },
        notaAquisicao: true,
      },
    });

    const nota = await this.notaAquisicao.criarFromOficio(oficio.id);

    return { ...oficio, notaAquisicao: nota };
  }

  async findAll() {
    return this.prisma.oficio.findMany({
      orderBy: { dataEnvio: 'desc' },
      include: {
        cliente: {
          select: {
            nomeCompleto: true,
            email: true,
            activo: true,
            papel: true,
            temCreditoEspecial: true,
            StockMovimento: true,
            creditoAcumulado: true,
          },
        },
        notaAquisicao: true,
      },
    });
  }

  async findByCliente(usuarioId: string) {
    const cliente = await this.prisma.usuario.findUnique({
      where: { id: usuarioId, papel: 'CLIENTE' },
    });

    if (!cliente) throw new NotFoundException('Cliente não encontrado');

    return this.prisma.oficio.findMany({
      where: { clienteId: cliente.id },
      orderBy: { dataEnvio: 'desc' },
      include: {
        notaAquisicao: true,
      },
    });
  }
}
