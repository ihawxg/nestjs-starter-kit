import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SupportedLocale } from '../supported-locale.enum';

export class LocalizedSourceDto {
  @ApiPropertyOptional({
    enum: SupportedLocale,
    default: SupportedLocale.EN,
    description:
      'Locale of the localized text fields in this request. Defaults to English.',
  })
  @IsOptional()
  @IsEnum(SupportedLocale)
  sourceLocale?: SupportedLocale;
}
