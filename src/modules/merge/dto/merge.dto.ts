import { ApiProperty } from '@nestjs/swagger';

export class MergeDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'PDF files in the desired order (2 to 20)',
  })
  files: Express.Multer.File[];
}
