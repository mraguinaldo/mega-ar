/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/auth/auth.controller.ts
import { Controller, Post, Body, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Patch('update-password')
  @UseGuards(AuthGuard('jwt'))
  async updatePassword(
    @Req() req: Request & { user: any },
    @Body() dto: UpdatePasswordDto,
  ) {
    const usuarioId = req.user.sub;
    return this.authService.updatePassword(usuarioId, dto);
  }
}
