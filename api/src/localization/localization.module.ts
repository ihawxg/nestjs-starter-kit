import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalizationAdminController } from './controllers/localization-admin.controller';
import { LocalizationService } from './localization.service';
import { ParseLocalePipe } from './parse-locale.pipe';
import { DeepLTranslationProvider } from './providers/deepl-translation.provider';
import { NoopTranslationProvider } from './providers/noop-translation.provider';
import {
  TRANSLATION_PROVIDER,
  TranslationProvider,
} from './providers/translation-provider';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [LocalizationAdminController],
  providers: [
    {
      provide: TRANSLATION_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TranslationProvider => {
        const enabled =
          configService.get<boolean>('translation.autoEnabled') ?? false;
        const provider =
          configService.get<string>('translation.provider') ?? 'deepl';
        const authKey = configService.get<string>('translation.deeplAuthKey');
        const englishTarget =
          configService.get<string>('translation.deeplTargetEnglishVariant') ??
          'en-US';

        if (enabled && provider === 'deepl' && authKey) {
          return new DeepLTranslationProvider(
            authKey,
            englishTarget as 'en-US' | 'en-GB',
          );
        }

        return new NoopTranslationProvider();
      },
    },
    LocalizationService,
    ParseLocalePipe,
  ],
  exports: [LocalizationService, ParseLocalePipe, TRANSLATION_PROVIDER],
})
export class LocalizationModule {}
