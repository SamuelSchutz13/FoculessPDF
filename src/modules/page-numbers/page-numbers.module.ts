import { Module } from '@nestjs/common';
import { PageNumbersController } from './page-numbers.controller';
import { PageNumbersService } from './page-numbers.service';

@Module({
  controllers: [PageNumbersController],
  providers: [PageNumbersService],
})
export class PageNumbersModule {}
