import { Module } from '@nestjs/common';
import { StockMovimentoService } from './stock-movimento.service';
import { StockMovimentoController } from './stock-movimento.controller';

@Module({
  controllers: [StockMovimentoController],
  providers: [StockMovimentoService],
})
export class StockMovimentoModule {}
