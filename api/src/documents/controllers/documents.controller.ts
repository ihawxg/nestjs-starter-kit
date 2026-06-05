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
import { ListDocumentsQueryDto } from '../dto/list-documents-query.dto';
import { DocumentsService } from '../documents.service';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async list(@Query() query: ListDocumentsQueryDto) {
    const documents = await this.documentsService.listPublished(query);

    return {
      documents,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const document = await this.documentsService.getPublishedBySlug(slug);

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
