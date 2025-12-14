import { PartialType } from '@nestjs/mapped-types';
import { CreateStockMovimentoDto } from './create-stock-movimento.dto';

export class UpdateStockMovimentoDto extends PartialType(CreateStockMovimentoDto) {}
