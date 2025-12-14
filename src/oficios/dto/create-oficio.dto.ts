import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TipoEquipamento } from '@prisma/client';

export class CreateOficioDto {
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString()
  @MinLength(20, { message: 'A descrição deve ter pelo menos 20 caracteres' })
  descricao: string;

  @IsNotEmpty({ message: 'Selecione o tipo de equipamento' })
  @IsEnum(TipoEquipamento, {
    message: `Tipo inválido. Opções: ${Object.values(TipoEquipamento).join(', ')}`,
  })
  tipoEquipamento: TipoEquipamento;

  @IsNotEmpty()
  @IsString()
  quantidade: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Local muito curto' })
  localInstalacao: string;

  @IsOptional()
  @IsString()
  justificativa?: string;
}
