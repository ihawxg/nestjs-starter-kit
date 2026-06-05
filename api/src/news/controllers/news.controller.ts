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
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListNewsQueryDto } from '../dto/list-news-query.dto';
import { NewsService } from '../news.service';

@ApiTags('news')
@RateLimit(RateLimitBucket.PUBLIC)
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
