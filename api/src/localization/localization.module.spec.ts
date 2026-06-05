import { MODULE_METADATA } from '@nestjs/common/constants';
import { ConfigModule } from '@nestjs/config';
import { LocalizationModule } from './localization.module';

describe('LocalizationModule', () => {
  it('imports ConfigModule for translation provider configuration', () => {
    const imports = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      LocalizationModule,
    );

    expect(imports).toContain(ConfigModule);
  });
});
