/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/usuario/usuario.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Papel } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @UseGuards()
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return await this.usuarioService.create(createUsuarioDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @UseGuards(RolesGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const usuarioLogado = req.user;

    if (!usuarioLogado) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const usuario = await this.usuarioService.findOne(id);
    if (!usuario) {
      throw new BadRequestException(`Usuário com ID ${id} não encontrado`);
    }

    return usuario;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('papel/:papel')
  @Roles(Papel.ADMIN)
  @UseGuards(RolesGuard)
  async findByPapel(@Param('papel') papelStr: string) {
    const papel = papelStr.toUpperCase() as Papel;

    if (!Object.values(Papel).includes(papel)) {
      throw new BadRequestException(
        `Papel inválido. Valores aceitos: ${Object.values(Papel).join(', ')}`,
      );
    }

    return this.usuarioService.findByPaper(papel);
  }
}
