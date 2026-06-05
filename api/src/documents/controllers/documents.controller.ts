import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListDocumentsQueryDto } from '../dto/list-documents-query.dto';
import { DocumentsService } from '../documents.service';

@ApiTags('documents')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['documents', 'en/documents', 'bg/documents'])
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async list(
    @Query() query: ListDocumentsQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const documents = await this.documentsService.listPublished(query, locale);

    return {
      documents,
    };
  }

  @Get(':slug')
  async detail(
    @Param('slug') slug: string,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const document = await this.documentsService.getPublishedBySlug(
      slug,
      locale,
    );

    return {
      document,
    };
  }

  @Get(':slug/assets/:assetId/download')
  async downloadAsset(
    @Param('slug') slug: string,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Res() response: Response,
  ) {
    const file = await this.documentsService.getPublishedAssetDownload(
      slug,
      assetId,
    );

    this.documentsService.sendDownload(response, file);
  }
}
