import { ApiProperty } from '@nestjs/swagger';

export class ImageToPdfDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'JPEG or PNG images; each becomes one page',
  })
  files: Express.Multer.File[];
}
