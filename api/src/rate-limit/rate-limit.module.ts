import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RateLimitService } from './rate-limit.service';

@Module({
  imports: [ConfigModule],
  providers: [
    RateLimitService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
  exports: [RateLimitService],
})
export class RateLimitModule {}
