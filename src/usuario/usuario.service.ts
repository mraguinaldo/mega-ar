/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Papel } from '@prisma/client';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, 10);

    try {
      return await this.prisma.usuario.create({
        data: {
          nomeCompleto: createUsuarioDto.nomeCompleto,
          email: createUsuarioDto.email.toLowerCase().trim(),
          senhaHash,
          contacto: createUsuarioDto.contacto,
          endereco: createUsuarioDto.endereco,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = (error.meta?.target?.[0] as string) || 'desconhecido';

        const mensagens: Record<string, string> = {
          email: 'O email já está sendo usado por outro usuário',
          contacto: 'Este número de contacto já está cadastrado',
        };

        throw new BadRequestException({
          message: mensagens[field] || `O campo ${field} já está em uso`,
          field,
        });
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.usuario.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        contacto: true,
        endereco: true,
        papel: true,
        activo: true,
        criadoEm: true,
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    try {
      return await this.prisma.usuario.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          nomeCompleto: true,
          email: true,
          contacto: true,
          endereco: true,
          papel: true,
          activo: true,
          senhaHash: true,
          criadoEm: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const data: any = { ...updateUsuarioDto };
    if (updateUsuarioDto.senha) {
      data.senhaHash = await bcrypt.hash(updateUsuarioDto.senha, 10);
      delete data.senha;
    }

    try {
      return await this.prisma.usuario.update({
        where: { id },
        data,
        select: {
          id: true,
          nomeCompleto: true,
          email: true,
          contacto: true,
          endereco: true,
          papel: true,
          activo: true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const field = (error.meta?.target?.[0] as string) || 'campo';
        throw new BadRequestException({
          message: `O ${field} já está em uso`,
          field,
        });
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.usuario.delete({ where: { id } });
      return { message: 'Usuário removido com sucesso' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findByPaper(papel: Papel) {
    return this.prisma.usuario.findMany({
      where: {
        papel,
      },
      select: {
        id: true,
        nomeCompleto: true,
        email: true,
        contacto: true,
        papel: true,
        activo: true,
      },
    });
  }
}
