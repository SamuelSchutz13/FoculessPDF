import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class WatermarkDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({ example: 'CONFIDENTIAL', maxLength: 100 })
  @IsString()
  @Length(1, 100)
  text: string;

  @ApiProperty({ minimum: 0.1, maximum: 1, default: 0.5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(1)
  opacity = 0.5;
}
