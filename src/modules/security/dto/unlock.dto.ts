import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UnlockDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  // No 4-char minimum here: the PDF may have been protected elsewhere with a shorter password.
  @ApiProperty({ format: 'password', minLength: 1, maxLength: 128 })
  @IsString()
  @Length(1, 128)
  password: string;
}
