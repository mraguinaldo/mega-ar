/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Papel, TipoEquipamento } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import {
  CreateCatalogoDto,
  EntradaStockDto,
  SaidaStockDto,
} from './dto/create-stock.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CatalogoService } from './stock.service';

@Controller('catalogo')
@UseGuards(AuthGuard('jwt'))
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('public')
  async findAllPublic() {
    return this.catalogoService.findAllPublic();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Papel.ADMIN)
  @Get()
  async findAll(@Req() req: any) {
    return this.catalogoService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('imagens'))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const dto: CreateCatalogoDto = {
      nome: body.nome,
      marca: body.marca,
      modelo: body.modelo,
      descricao: body.descricao,
      preco: parseFloat(body.preco),
      tipo: body.tipo as TipoEquipamento,
      imagens: files,
    };

    return this.catalogoService.create(dto);
  }

  @Patch(':id')
  @Roles(Papel.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor('imagens'))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    const dto: Partial<
      CreateCatalogoDto & { imagens?: Express.Multer.File[] }
    > = {
      nome: body.nome?.trim() || undefined,
      marca: body.marca?.trim() || undefined,
      modelo: body.modelo?.trim() || undefined,
      descricao: body.descricao?.trim() || undefined,
      preco: body.preco ? parseFloat(body.preco) : undefined,
      tipo: body.tipo as TipoEquipamento,
      stockAtual: body.stockAtual ? parseInt(body.stockAtual, 10) : undefined,
      ativo: body.ativo !== undefined ? body.ativo === 'true' : undefined,
      imagens: files?.length > 0 ? files : undefined,
    };

    // Remove campos undefined para não interferir no Partial
    Object.keys(dto).forEach(
      (key) => dto[key] === undefined && delete dto[key],
    );

    return this.catalogoService.update(id, dto);
  }

  @Patch(':id/desativar')
  @Roles(Papel.ADMIN)
  @UseGuards(RolesGuard)
  async deactivate(@Param('id') id: string) {
    return this.catalogoService.deactivate(id);
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.catalogoService.getById(id);
  }

  @Patch(':id/ativar')
  @Roles(Papel.ADMIN)
  @UseGuards(RolesGuard)
  async ativar(@Param('id') id: string) {
    return this.catalogoService.ativar(id);
  }

  @Post('stock/entrada')
  @Roles(Papel.ADMIN, Papel.FUNCIONARIO)
  @UseGuards(RolesGuard)
  async adicionarEntrada(@Body() body: EntradaStockDto, @Req() req: any) {
    if (!body.catalogoId || !body.quantidade || body.quantidade <= 0) {
      throw new BadRequestException(
        'catalogoId e quantidade são obrigatórios e quantidade > 0',
      );
    }
    return this.catalogoService.adicionarEntrada(
      body.catalogoId,
      body.quantidade,
      req.user.sub,
      body.motivo || 'Entrada manual',
    );
  }

  @Post('stock/saida')
  @Roles(Papel.ADMIN, Papel.FUNCIONARIO)
  @UseGuards(RolesGuard)
  async retirarStock(@Body() body: SaidaStockDto, @Req() req: any) {
    return this.catalogoService.retirarStock(
      body.catalogoId,
      body.quantidade,
      body.notaAquisicaoId,
      req.user.sub,
    );
  }

  @Get('stock/movimentos')
  @Roles(Papel.ADMIN, Papel.FUNCIONARIO)
  @UseGuards(RolesGuard)
  async getMovimentos() {
    return this.catalogoService.getMovimentos();
  }
}
