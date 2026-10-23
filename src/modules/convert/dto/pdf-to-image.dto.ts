import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum ImageFormat {
  Jpeg = 'jpeg',
  Png = 'png',
}

export class PdfToImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({ enum: ImageFormat, default: ImageFormat.Jpeg, required: false })
  @IsOptional()
  @IsEnum(ImageFormat)
  format: ImageFormat = ImageFormat.Jpeg;
}
