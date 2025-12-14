/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PagamentoService } from './pagamento.service';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Papel } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('pagamento')
@UseGuards(AuthGuard('jwt'))
export class PagamentoController {
  constructor(private readonly service: PagamentoService) {}

  @Post()
  async criar(@Body() dto: CreatePagamentoDto, @Req() req: any) {
    if (!dto.notaId || !dto.valor || !dto.tipo) {
      throw new BadRequestException('notaId, valor e tipo são obrigatórios');
    }

    return this.service.registrarPagamento(
      dto.notaId,
      dto.valor,
      dto.tipo,
      req.user.sub,
    );
  }

  @Get('nota/:notaId')
  @Roles(Papel.ADMIN, Papel.FUNCIONARIO)
  @UseGuards(RolesGuard)
  porNota(@Param('notaId') notaId: string) {
    return this.service.porNotaAquisicao(notaId);
  }

  @Get('meus')
  async meus(@Req() req: any) {
    if (req.user.papel !== Papel.CLIENTE) {
      throw new UnauthorizedException('Acesso negado');
    }
    return this.service.meusPagamentos(req.user.sub);
  }

  @Get('hoje')
  @Roles(Papel.ADMIN, Papel.FUNCIONARIO)
  @UseGuards(RolesGuard)
  hoje() {
    return this.service.totalHoje();
  }
}
