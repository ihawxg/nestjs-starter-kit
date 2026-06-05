import { SetMetadata } from '@nestjs/common';
import { RateLimitBucket } from '../rate-limit-bucket.enum';

export const RATE_LIMIT_BUCKET_KEY = 'rate-limit-bucket';

export const RateLimit = (bucket: RateLimitBucket) =>
  SetMetadata(RATE_LIMIT_BUCKET_KEY, bucket);
