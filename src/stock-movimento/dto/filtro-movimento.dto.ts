import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FiltroMovimentoDto {
  @IsOptional()
  @IsString()
  equipamento?: string;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
