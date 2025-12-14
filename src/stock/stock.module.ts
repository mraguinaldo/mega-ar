import { Module } from '@nestjs/common';
import { CatalogoService } from './stock.service';
import { CatalogoController } from './stock.controller';
import { NotaAquisicaoService } from 'src/nota-aquisicao/nota-aquisicao.service';

@Module({
  controllers: [CatalogoController],
  providers: [CatalogoService, NotaAquisicaoService],
})
export class CatalogoModule {}
