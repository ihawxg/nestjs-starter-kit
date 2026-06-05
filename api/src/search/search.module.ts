import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentEntity } from '../departments/entities/department.entity';
import { DocumentEntity } from '../documents/entities/document.entity';
import { EventEntity } from '../events/entities/event.entity';
import { NewsEntity } from '../news/entities/news.entity';
import { SearchController } from './controllers/search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NewsEntity,
      DocumentEntity,
      EventEntity,
      DepartmentEntity,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
