import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum CompressionLevel {
  Low = 'low',
  Recommended = 'recommended',
  Extreme = 'extreme',
}

export class CompressDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({ enum: CompressionLevel, default: CompressionLevel.Recommended, required: false })
  @IsOptional()
  @IsEnum(CompressionLevel)
  level: CompressionLevel = CompressionLevel.Recommended;
}
