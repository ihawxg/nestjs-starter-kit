import { DeepLClient } from 'deepl-node';
import { LocalizedFieldKind } from '../localization-specs';
import { SupportedLocale } from '../supported-locale.enum';
import { DeepLTranslationProvider } from './deepl-translation.provider';

jest.mock('deepl-node', () => ({
  DeepLClient: jest.fn().mockImplementation(() => ({
    translateText: jest.fn(async () => ({
      text: 'translated',
    })),
  })),
}));

describe('DeepLTranslationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps English to Bulgarian plain text requests', async () => {
    const provider = new DeepLTranslationProvider('test-key', 'en-US');

    const translated = await provider.translateValue(
      'Town update',
      SupportedLocale.EN,
      SupportedLocale.BG,
      {
        kind: LocalizedFieldKind.TEXT,
      },
    );

    const client = (DeepLClient as unknown as jest.Mock).mock.results[0]
      .value as {
      translateText: jest.Mock;
    };
    expect(translated).toBe('translated');
    expect(client.translateText).toHaveBeenCalledWith(
      'Town update',
      'en',
      'bg',
      expect.objectContaining({
        preserveFormatting: true,
      }),
    );
  });

  it('uses HTML tag handling for rich text and English target variant', async () => {
    const provider = new DeepLTranslationProvider('test-key', 'en-US');

    await provider.translateValue(
      '<p>Новина</p>',
      SupportedLocale.BG,
      SupportedLocale.EN,
      {
        kind: LocalizedFieldKind.HTML,
        context: 'Новина',
      },
    );

    const client = (DeepLClient as unknown as jest.Mock).mock.results[0]
      .value as {
      translateText: jest.Mock;
    };
    expect(client.translateText).toHaveBeenCalledWith(
      '<p>Новина</p>',
      'bg',
      'en-US',
      expect.objectContaining({
        tagHandling: 'html',
        tagHandlingVersion: 'v2',
        context: 'Новина',
      }),
    );
  });
});
