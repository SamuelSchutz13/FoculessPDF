import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { PAGE_RANGES_PATTERN } from '../../../common/constants/file.constants';

export class SplitDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({ example: '1-3,5,8-10', description: 'Each range becomes a separate PDF' })
  @Matches(PAGE_RANGES_PATTERN, { message: 'ranges must look like "1-3,5,8-10"' })
  ranges: string;
}
