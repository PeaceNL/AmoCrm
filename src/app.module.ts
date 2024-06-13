import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AmocrmService } from './amocrm/amocrm.service';
import { AmocrmModule } from './amocrm/amocrm.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), AmocrmModule] ,
  providers: [AmocrmService],
})
export class AppModule {}
