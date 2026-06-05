import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RATE_LIMIT_BUCKET_KEY } from '../decorators/rate-limit.decorator';
import { RateLimitBucket } from '../rate-limit-bucket.enum';
import { RateLimitService } from '../rate-limit.service';

interface RequestWithUser extends Request {
  user?: {
    id?: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const bucket = this.reflector.getAllAndOverride<RateLimitBucket>(
      RATE_LIMIT_BUCKET_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!bucket) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    this.rateLimitService.consume(bucket, this.getIdentity(request));
    return true;
  }

  private getIdentity(request: RequestWithUser): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwarded = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor;
    const actor = request.user?.id ? `user:${request.user.id}` : undefined;
    return actor ?? forwarded?.split(',')[0].trim() ?? request.ip ?? 'unknown';
  }
}
