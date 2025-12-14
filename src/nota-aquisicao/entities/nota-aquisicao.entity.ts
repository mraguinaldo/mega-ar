import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EstadoNota } from '@prisma/client';

export class AnalisarNotaDto {
  @IsEnum(EstadoNota)
  estado: EstadoNota;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsInt()
  quantidadeAprovada?: number;
}
