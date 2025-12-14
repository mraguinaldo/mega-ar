import { PartialType } from '@nestjs/mapped-types';
import { CreateCatalogoDto } from './create-stock.dto';

export class UpdateStockDto extends PartialType(CreateCatalogoDto) {}
