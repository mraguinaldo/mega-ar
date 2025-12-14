import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaAquisicaoDto } from './create-nota-aquisicao.dto';

export class UpdateNotaAquisicaoDto extends PartialType(
  CreateNotaAquisicaoDto,
) {}
