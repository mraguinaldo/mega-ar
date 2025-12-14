import { Module } from '@nestjs/common';
import { NotaAquisicaoService } from './nota-aquisicao.service';
import { NotaAquisicaoController } from './nota-aquisicao.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [NotaAquisicaoController],
  providers: [NotaAquisicaoService, PrismaService],
})
export class NotaAquisicaoModule {}
