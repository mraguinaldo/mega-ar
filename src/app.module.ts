import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OficiosModule } from './oficios/oficios.module';
import { NotaAquisicaoModule } from './nota-aquisicao/nota-aquisicao.module';
import { StockMovimentoModule } from './stock-movimento/stock-movimento.module';
import { PagamentoModule } from './pagamento/pagamento.module';
import { CatalogoModule } from './stock/stock.module';

@Module({
  imports: [
    PrismaModule,
    UsuarioModule,
    AuthModule,
    OficiosModule,
    NotaAquisicaoModule,
    StockMovimentoModule,
    PagamentoModule,
    CatalogoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
