import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AmocrmService } from './amocrm.service';
import { AmocrmController } from './amocrm.controller';

@Module({
  imports: [HttpModule],
  providers: [AmocrmService],
  controllers: [AmocrmController],
})

export class AmocrmModule {}
