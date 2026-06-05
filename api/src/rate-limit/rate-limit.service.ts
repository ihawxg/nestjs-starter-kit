import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimitBucket } from './rate-limit-bucket.enum';

interface RateLimitState {
  count: number;
  resetAt: number;
}

interface RateLimitBucketConfig {
  limit: number;
  windowMs: number;
}

@Injectable()
export class RateLimitService {
  private readonly buckets = new Map<string, RateLimitState>();

  constructor(private readonly configService: ConfigService) {}

  consume(bucket: RateLimitBucket, identity: string): void {
    const config = this.getBucketConfig(bucket);
    const now = Date.now();
    const key = `${bucket}:${identity}`;
    const current = this.buckets.get(key);

    if (!current || current.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return;
    }

    if (current.count >= config.limit) {
      throw new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
  }

  reset(): void {
    this.buckets.clear();
  }

  getBucketConfig(bucket: RateLimitBucket): RateLimitBucketConfig {
    const configured =
      this.configService.get<RateLimitBucketConfig>(`rateLimit.${bucket}`) ??
      undefined;

    if (configured?.limit && configured?.windowMs) {
      return configured;
    }

    return {
      limit: 100,
      windowMs: 60_000,
    };
  }
}
