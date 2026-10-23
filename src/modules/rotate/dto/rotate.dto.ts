import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, Matches } from 'class-validator';
import { PAGE_RANGES_PATTERN } from '../../../common/constants/file.constants';

export const ROTATION_ANGLES = [90, 180, 270] as const;
export type RotationAngle = (typeof ROTATION_ANGLES)[number];

export class RotateDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({ enum: ROTATION_ANGLES, description: 'Clockwise rotation in degrees' })
  @Type(() => Number)
  @IsIn(ROTATION_ANGLES)
  angle: RotationAngle;

  @ApiProperty({ example: '1-3,5', required: false, description: 'Defaults to all pages' })
  @IsOptional()
  @Matches(PAGE_RANGES_PATTERN, { message: 'pages must look like "1-3,5"' })
  pages?: string;
}
