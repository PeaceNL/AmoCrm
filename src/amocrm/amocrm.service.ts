import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AmocrmService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly authCode: string;
  private readonly subdomain: string;
  private accessToken: string = "";
  private refreshToken: string= "";

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('AMOCRM_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('AMOCRM_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>('AMOCRM_REDIRECT_URI');
    this.authCode = this.configService.get<string>('AMOCRM_AUTH_CODE');
    this.subdomain = this.configService.get<string>('AMOCRM_SUBDOMAIN');
    this.accessToken = '';
    this.refreshToken = '';
  }

  async getAccessToken(): Promise<void> {
    const url = `https://${this.subdomain}.amocrm.ru/oauth2/access_token`;
    const data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      code: this.authCode,
      redirect_uri: this.redirectUri,
    }; 

    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'amoCRM-oAuth-client/1.0',
        },
      });
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error.response.status);
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async refreshAccessToken(): Promise<void> {
    const url = `https://${this.subdomain}.amocrm.ru/oauth2/access_token`;
    const data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      redirect_uri: this.redirectUri,
    };

    try {
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'amoCRM-oAuth-client/1.0',
        },
      });
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error.response ? error.response.status : null);
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
    }
  }

  async getLeads(query?: string): Promise<any> {
    
    let url = `https://${this.subdomain}.amocrm.ru/api/v4/leads`;
    const params = query && query.length > 3 ? { query } : {};    
  
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        params,
      });
  
      return response.data._embedded.leads.map((lead: any) => ({
        id: lead.id,
        name: lead.name,
        price: lead.price,
        responsible_user_id: lead.responsible_user_id,
        group_id: lead.group_id,
        status_id: lead.status_id,
        pipeline_id: lead.pipeline_id,
        loss_reason_id: lead.loss_reason_id,
        created_by: lead.created_by,
        updated_by: lead.updated_by,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        closed_at: lead.closed_at,
        closest_task_at: lead.closest_task_at,
        is_deleted: lead.is_deleted,
        custom_fields_values: lead.custom_fields_values,
        score: lead.score,
        account_id: lead.account_id,
        labor_cost: lead.labor_cost,
      }));
    } catch (error) {
        if (error.response && error.response.status === 401) {
            await this.refreshAccessToken();
            return this.getLeads(query);
          }
          throw new HttpException('Error fetching leads', HttpStatus.BAD_REQUEST);
    }
  }

  private getErrorMessage(statusCode: number): string {
    const errors: { [key: number]: string } = {
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      500: 'Internal server error',
      502: 'Bad gateway',
      503: 'Service unavailable',
    };
    return errors[statusCode] || 'Undefined error';
  }
}
