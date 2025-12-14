import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsuarioModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mega-ar-super-secreto-2025',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService, PrismaService, JwtStrategy],
  exports: [UsuarioService],
})
export class UsuarioModule {}
