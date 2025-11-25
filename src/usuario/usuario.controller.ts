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
@UseGuards(AuthGuard('jwt'))
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @UseGuards()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @Roles(Papel.ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const usuarioLogado = req.user;

    if (usuarioLogado.papel !== Papel.ADMIN && usuarioLogado.sub !== id) {
      throw new UnauthorizedException('Você só pode ver o próprio perfil');
    }

    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() req: any,
  ) {
    const usuarioLogado = req.user;

    if (usuarioLogado.papel !== Papel.ADMIN && usuarioLogado.sub !== id) {
      throw new UnauthorizedException('Você só pode editar o próprio perfil');
    }

    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles(Papel.ADMIN)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }

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
