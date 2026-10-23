import { Module } from '@nestjs/common';
import { RotateController } from './rotate.controller';
import { RotateService } from './rotate.service';

@Module({
  controllers: [RotateController],
  providers: [RotateService],
})
export class RotateModule {}
