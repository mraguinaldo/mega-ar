import { Papel } from '@prisma/client';
import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nomeCompleto: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsString()
  @MaxLength(9, { message: 'O contacto deve ter no máximo 9 caracteres' })
  contacto: string;

  @IsString()
  @IsOptional()
  endereco?: string;

  @IsEnum(Papel, {
    message: `Papel deve ser um dos seguintes valores: ${Object.values(Papel).join(', ')}`,
  })
  @IsOptional()
  papel?: Papel;

  @IsOptional()
  activo?: boolean;
}
