import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum PageNumberPosition {
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right',
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
}

export class PageNumbersDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({
    enum: PageNumberPosition,
    default: PageNumberPosition.BottomCenter,
    required: false,
  })
  @IsOptional()
  @IsEnum(PageNumberPosition)
  position: PageNumberPosition = PageNumberPosition.BottomCenter;

  @ApiProperty({ minimum: 1, default: 1, required: false, description: 'First page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  startAt = 1;
}
