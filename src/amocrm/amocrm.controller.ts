import { Controller, Get, Post, Query } from '@nestjs/common';
import { AmocrmService } from './amocrm.service';
import { query } from 'express';

@Controller('api')
export class AmocrmController {
  constructor(private readonly amocrmService: AmocrmService) {}

  @Get('leads')
  async getLeads(@Query('query') query: string): Promise<any> {
    if (query && query.length > 3) {
        return this.amocrmService.getLeads(query)        
    } else {
        return this.amocrmService.getLeads();
    }
    
    
  } 

  @Get('token')
  async Token(): Promise<any> {
    return this.amocrmService.getAccessToken();
  }
}


