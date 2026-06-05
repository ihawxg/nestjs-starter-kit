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
import { ListNewsQueryDto } from '../dto/list-news-query.dto';
import { NewsService } from '../news.service';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async list(@Query() query: ListNewsQueryDto) {
    const news = await this.newsService.listPublished(query);

    return {
      news,
    };
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const news = await this.newsService.getPublishedBySlug(slug);

    return {
      news,
    };
  }

  @Get(':slug/assets/:assetId/download')
  async downloadAsset(
    @Param('slug') slug: string,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Res() response: Response,
  ) {
    const file = await this.newsService.getPublishedAssetDownload(
      slug,
      assetId,
    );

    this.newsService.sendDownload(response, file);
  }
}
