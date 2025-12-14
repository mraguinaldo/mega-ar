// src/catalogo/dto/create-catalogo.dto.ts
import { IsString, IsEnum, Min, IsOptional, IsInt } from 'class-validator';
import { TipoEquipamento } from '@prisma/client';

export class CreateCatalogoDto {
  @IsString() nome: string;
  @IsString() marca: string;
  @IsString() modelo: string;
  @IsString() descricao: string;
  @IsString() @Min(0) preco: number;
  @IsEnum(TipoEquipamento) tipo: TipoEquipamento;
  imagens?: Express.Multer.File[];

  @IsOptional() @IsInt() @Min(0) stockAtual?: number;
  @IsOptional() ativo?: boolean;
}

export class EntradaStockDto {
  @IsString() catalogoId: string;
  @IsInt() @Min(1) quantidade: number;
  @IsString() @IsOptional() motivo?: string;
}

export class SaidaStockDto {
  @IsString() catalogoId: string;
  @IsInt() @Min(1) quantidade: number;
  @IsString() notaAquisicaoId: string;
}
