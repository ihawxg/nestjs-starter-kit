import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RequestLocale } from '../../localization/request-locale.decorator';
import { SupportedLocale } from '../../localization/supported-locale.enum';
import { RateLimit } from '../../rate-limit/decorators/rate-limit.decorator';
import { RateLimitBucket } from '../../rate-limit/rate-limit-bucket.enum';
import { ListNewsQueryDto } from '../dto/list-news-query.dto';
import { NewsService } from '../news.service';
import { NewsItemResponseDto, NewsListResponseDto } from '../news-response';

@ApiTags('news')
@RateLimit(RateLimitBucket.PUBLIC)
@Controller(['news', 'en/news', 'bg/news'])
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOkResponse({
    type: NewsListResponseDto,
  })
  async list(
    @Query() query: ListNewsQueryDto,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const news = await this.newsService.listPublished(query, locale);

    return {
      news,
    };
  }

  @Get(':slug')
  @ApiOkResponse({
    type: NewsItemResponseDto,
  })
  async detail(
    @Param('slug') slug: string,
    @RequestLocale() locale: SupportedLocale,
  ) {
    const news = await this.newsService.getPublishedBySlug(slug, locale);

    return {
      news,
    };
  }

  @Get(':slug/assets/:assetId/download')
  @ApiOkResponse({
    description: 'Streams a published news asset for public download.',
  })
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
