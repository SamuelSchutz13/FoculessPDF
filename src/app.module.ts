import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { env } from './config/env';
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
    // shortcut: limits by req.ip, in memory; behind a reverse proxy enable "trust proxy",
    // and with several API instances move the storage to Redis.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: env.rateLimitPerMinute }],
      errorMessage: 'Too many requests, please try again in a minute',
    }),
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
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
