import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimitBucket } from './rate-limit-bucket.enum';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  it('throws when a configured bucket limit is exceeded', () => {
    const service = new RateLimitService({
      get: jest.fn().mockReturnValue({
        limit: 2,
        windowMs: 60_000,
      }),
    } as unknown as ConfigService);

    service.consume(RateLimitBucket.LOGIN, 'ip:127.0.0.1');
    service.consume(RateLimitBucket.LOGIN, 'ip:127.0.0.1');

    expect(() =>
      service.consume(RateLimitBucket.LOGIN, 'ip:127.0.0.1'),
    ).toThrow(HttpException);
    expect(() =>
      service.consume(RateLimitBucket.LOGIN, 'ip:127.0.0.1'),
    ).toThrow('Rate limit exceeded');
  });

  it('uses the HTTP 429 status code', () => {
    const service = new RateLimitService({
      get: jest.fn().mockReturnValue({
        limit: 1,
        windowMs: 60_000,
      }),
    } as unknown as ConfigService);

    service.consume(RateLimitBucket.LOGIN, 'ip:127.0.0.1');

    try {
      service.consume(RateLimitBucket.LOGIN, 'ip:127.0.0.1');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  });
});
