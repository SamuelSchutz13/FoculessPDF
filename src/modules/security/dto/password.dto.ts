import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

/** Shared by protect and unlock: a PDF plus its password. */
export class PasswordDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({ format: 'password', minLength: 4, maxLength: 128 })
  @IsString()
  @Length(4, 128)
  password: string;
}
