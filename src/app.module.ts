import { Module } from '@nestjs/common';
import { CompressModule } from './modules/compress/compress.module';
import { ConvertModule } from './modules/convert/convert.module';
import { HealthModule } from './modules/health/health.module';
import { MergeModule } from './modules/merge/merge.module';
import { OrganizeModule } from './modules/organize/organize.module';
import { PageNumbersModule } from './modules/page-numbers/page-numbers.module';
import { RotateModule } from './modules/rotate/rotate.module';
import { SecurityModule } from './modules/security/security.module';
import { SplitModule } from './modules/split/split.module';
import { WatermarkModule } from './modules/watermark/watermark.module';

@Module({
  imports: [
    HealthModule,
    MergeModule,
    SplitModule,
    CompressModule,
    RotateModule,
    OrganizeModule,
    ConvertModule,
    WatermarkModule,
    PageNumbersModule,
    SecurityModule,
  ],
})
export class AppModule {}
