import { IsNotEmpty, IsNumber, IsString, IsIn } from 'class-validator';

export class CreatePagamentoDto {
  @IsNotEmpty()
  notaId: string;

  @IsNumber()
  valor: number;

  @IsString()
  @IsIn(['IMEDIATO', 'PRESTACAO'])
  tipo: 'IMEDIATO' | 'PRESTACAO';
}
