import {
  DeepLClient,
  SourceLanguageCode,
  TargetLanguageCode,
  TranslateTextOptions,
} from 'deepl-node';
import { LocalizedFieldKind } from '../localization-specs';
import { SupportedLocale } from '../supported-locale.enum';
import {
  TranslateValueOptions,
  TranslationProvider,
} from './translation-provider';

export class DeepLTranslationProvider implements TranslationProvider {
  readonly name = 'deepl';
  private readonly client: DeepLClient;

  constructor(
    authKey: string,
    private readonly englishTargetLanguage: TargetLanguageCode,
  ) {
    this.client = new DeepLClient(authKey);
  }

  isEnabled(): boolean {
    return true;
  }

  async translateValue(
    value: string,
    sourceLocale: SupportedLocale,
    targetLocale: SupportedLocale,
    options: TranslateValueOptions,
  ): Promise<string> {
    const result = await this.client.translateText(
      value,
      this.toSourceLanguage(sourceLocale),
      this.toTargetLanguage(targetLocale),
      this.toDeepLOptions(options),
    );

    return result.text;
  }

  private toSourceLanguage(locale: SupportedLocale): SourceLanguageCode {
    return locale === SupportedLocale.BG ? 'bg' : 'en';
  }

  private toTargetLanguage(locale: SupportedLocale): TargetLanguageCode {
    return locale === SupportedLocale.BG ? 'bg' : this.englishTargetLanguage;
  }

  private toDeepLOptions(options: TranslateValueOptions): TranslateTextOptions {
    const requestOptions: TranslateTextOptions = {
      preserveFormatting: true,
      modelType: 'prefer_quality_optimized',
    };

    if (options.context) {
      requestOptions.context = options.context;
    }

    if (options.kind === LocalizedFieldKind.HTML) {
      requestOptions.tagHandling = 'html';
      requestOptions.tagHandlingVersion = 'v2';
      requestOptions.splitSentences = 'nonewlines';
    }

    return requestOptions;
  }
}
