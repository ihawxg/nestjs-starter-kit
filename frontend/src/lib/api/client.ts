import { getPublicApiBaseUrl } from '@/lib/config/env';
import { client } from './generated/client.gen';

export function setupPublicApiClient(baseUrl = getPublicApiBaseUrl()): string {
  client.setConfig({
    baseUrl,
    throwOnError: false,
  });

  return baseUrl;
}
