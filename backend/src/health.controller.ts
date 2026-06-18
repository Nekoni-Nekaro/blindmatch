import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get('health')
  async health() {
    const dbOk = this.dataSource.isInitialized;
    return {
      status: dbOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      db: dbOk ? 'connected' : 'disconnected',
      uptime: Math.floor(process.uptime()),
    };
  }
}
