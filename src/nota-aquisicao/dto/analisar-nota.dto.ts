import { IsIn, IsOptional, IsString } from 'class-validator';

export class AnalisarNotaDto {
  @IsIn(['APROVAR', 'RECUSAR'])
  acao: 'APROVAR' | 'RECUSAR';

  @IsOptional()
  @IsString()
  motivoRecusa?: string;
}
