import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ProtectDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;

  @ApiProperty({ format: 'password', minLength: 4, maxLength: 128 })
  @IsString()
  @Length(4, 128)
  password: string;
}
