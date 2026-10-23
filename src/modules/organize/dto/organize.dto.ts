import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { PAGE_ORDER_PATTERN } from '../../../common/constants/file.constants';

export class OrganizeDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({ example: '3,1,2', description: 'New page order; omitted pages are removed' })
  @Matches(PAGE_ORDER_PATTERN, { message: 'order must look like "3,1,2"' })
  order: string;
}
