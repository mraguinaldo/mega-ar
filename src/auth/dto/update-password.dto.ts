import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  senhaAtual: string;

  @IsString()
  @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' })
  novaSenha: string;
}
