/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UnauthorizedException,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { NotaAquisicaoService } from './nota-aquisicao.service';
import { Papel } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateNotaFromOficioDto } from './dto/create-from-oficio.dto';
import { AnalisarNotaDto } from './dto/analisar-nota.dto';

@Controller('nota-aquisicao')
@UseGuards(AuthGuard('jwt'))
export class NotaAquisicaoController {
  constructor(private readonly service: NotaAquisicaoService) {}

  @Post('from-oficio')
  @Roles(Papel.FUNCIONARIO, Papel.ADMIN)
  @UseGuards(RolesGuard)
  async createFromOficio(@Body() dto: CreateNotaFromOficioDto) {
    return this.service.criarFromOficio(dto.oficioId);
  }

  @Get()
  @Roles(Papel.FUNCIONARIO, Papel.ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = req.user as { sub: string; papel: Papel };

    if (user.papel === Papel.CLIENTE) {
      const nota = await this.service.findOne(id);
      if (!nota) throw new NotFoundException('Nota não encontrada');
      if (nota.clienteId !== user.sub) {
        throw new UnauthorizedException(
          'Você só pode visualizar suas próprias notas',
        );
      }
    }

    return this.service.findOne(id);
  }

  @Patch(':id/analisar')
  @Roles(Papel.FUNCIONARIO, Papel.ADMIN)
  @UseGuards(RolesGuard)
  async analisar(
    @Param('id') id: string,
    @Body() dto: AnalisarNotaDto,
    @Req() req: any,
  ) {
    const usuarioId = req.user.sub;
    return this.service.analisar(id, dto, usuarioId);
  }

  @Get('minhas')
  async minhas(@Req() req: any) {
    if (req.user.papel !== Papel.CLIENTE) {
      throw new UnauthorizedException('Acesso negado');
    }
    return this.service.findByClienteUsuarioId(req.user.sub);
  }
}
