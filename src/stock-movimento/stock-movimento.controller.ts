import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StockMovimentoService } from './stock-movimento.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Papel } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FiltroMovimentoDto } from './dto/filtro-movimento.dto';

@Controller('stock-movimento')
@UseGuards(AuthGuard('jwt'))
export class StockMovimentoController {
  constructor(private readonly service: StockMovimentoService) {}

  @Get()
  @Roles(Papel.ADMIN, Papel.FUNCIONARIO)
  @UseGuards(RolesGuard)
  findAll(@Query() filtro?: FiltroMovimentoDto) {
    return this.service.findAll(filtro);
  }

  @Get('por-equipamento')
  @Roles(Papel.ADMIN, Papel.FUNCIONARIO)
  @UseGuards(RolesGuard)
  porEquipamento() {
    return this.service.porEquipamento();
  }

  @Get('recentes')
  recentes() {
    return this.service.recentes();
  }
}
