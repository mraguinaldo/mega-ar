/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

  @Post('normal')
  async criarPagamentoNormal(@Body() dto: CreatePagamentoDto, @Req() req: any) {
    if (!dto.notaId || !dto.valor || !dto.tipo) {
      throw new BadRequestException('notaId, valor e tipo são obrigatórios');
    }
    if (req.user.papel === Papel.CLIENTE) {
      throw new UnauthorizedException('Acesso negado');
    }

    return this.service.registrarPagamentoNormal(
      dto.notaId,
      dto.valor,
      dto.tipo,
      req.user.sub,
    );
  }

  @Post('credito')
  async usarCreditoEspecial(@Body() body: { notaId: string }, @Req() req: any) {
    if (!body.notaId) {
      throw new BadRequestException('notaId é obrigatório');
    }

    if (req.user.papel === Papel.CLIENTE) {
      throw new UnauthorizedException('Acesso negado');
    }

    return this.service.pagarComCreditoEspecial(body.notaId, req.user.sub);
  }

  @Post('adicionar-credito')
  async adicionarCredito(@Body() body: { valor: number }, @Req() req: any) {
    if (!body.valor || body.valor <= 0) {
      throw new BadRequestException('Valor positivo é obrigatório');
    }

    if (req.user.papel !== Papel.CLIENTE) {
      throw new UnauthorizedException('Acesso negado');
    }

    return this.service.adicionarCreditoEspecial(req.user.sub, body.valor);
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

  @Get()
  async listar(@Req() req: any) {
    const papel = req.user.papel;

    if (papel === Papel.CLIENTE) {
      return this.service.meusPagamentos(req.user.sub);
    }

    if (papel === Papel.ADMIN || papel === Papel.FUNCIONARIO) {
      return this.service.todosPagamentos();
    }

    throw new UnauthorizedException('Acesso negado');
  }
}
