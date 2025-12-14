/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioService.findByEmail(dto.email);
    if (!usuario) throw new UnauthorizedException('Credenciais inválidas');

    if (!usuario.activo)
      throw new UnauthorizedException(
        'Conta desativada, entre em contato com o suporte',
      );

    const senhaOk = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaOk) throw new UnauthorizedException('Credenciais inválidas');

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nomeCompleto: usuario.nomeCompleto,
        email: usuario.email,
        papel: usuario.papel,
      },
    };
  }

  async updatePassword(usuarioId: string, dto: UpdatePasswordDto) {
    const usuario = await this.usuarioService.findOne(usuarioId);

    const senhaAtualCorreta = await bcrypt.compare(
      dto.senhaAtual,
      usuario.senhaHash ?? '',
    );
    if (!senhaAtualCorreta) {
      throw new BadRequestException('A senha atual está incorreta');
    }

    await this.usuarioService.update(usuarioId, {
      senha: dto.novaSenha,
    } as any);

    return { message: 'Senha alterada com sucesso!' };
  }
}
