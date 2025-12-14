/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { OficiosService } from './oficios.service';
import { CreateOficioDto } from './dto/create-oficio.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Papel } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('oficio')
@UseGuards(AuthGuard('jwt'))
export class OficiosController {
  constructor(private readonly oficiosService: OficiosService) {}

  @Post()
  @UseInterceptors(FileInterceptor('pdfAnexo'))
  create(
    @Body() dto: CreateOficioDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.oficiosService.create(dto, req.user.sub, file);
  }

  @Get()
  @Roles(Papel.ADMIN, Papel.FUNCIONARIO)
  @UseGuards(RolesGuard)
  findAll() {
    return this.oficiosService.findAll();
  }

  @Get('meus')
  meusOficios(@Req() req: any) {
    return this.oficiosService.findByCliente(req.user.sub);
  }
}
