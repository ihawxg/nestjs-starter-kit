import { BadRequestException } from '@nestjs/common';
import { TranslationProvider } from './translation-provider';

export class NoopTranslationProvider implements TranslationProvider {
  readonly name = null;

  isEnabled(): boolean {
    return false;
  }

  translateValue(): Promise<string> {
    throw new BadRequestException(
      'Auto-translation provider is not configured',
    );
  }
}
