import { Module } from '@nestjs/common';
import { OficiosService } from './oficios.service';
import { OficiosController } from './oficios.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotaAquisicaoService } from 'src/nota-aquisicao/nota-aquisicao.service';

@Module({
  controllers: [OficiosController],
  providers: [OficiosService, PrismaService, NotaAquisicaoService],
  exports: [OficiosService],
})
export class OficiosModule {}
