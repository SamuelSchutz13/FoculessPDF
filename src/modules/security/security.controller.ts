import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { MimeType, uploadOptions } from '../../common/constants/file.constants';
import { ApiFileOperation } from '../../common/decorators/api-file-operation.decorator';
import { fileResponse } from '../../common/files/file-response';
import { PdfFilePipe } from '../../common/files/file-validation.pipes';
import { PasswordDto } from './dto/password.dto';
import { SecurityService } from './security.service';

@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('protect')
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({
    summary: 'Encrypt a PDF with a password',
    body: PasswordDto,
    produces: MimeType.PDF,
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async protect(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: PasswordDto,
  ): Promise<StreamableFile> {
    const pdf = await this.securityService.protect(file.buffer, dto.password);
    return fileResponse(pdf, 'protected.pdf', MimeType.PDF);
  }

  @Post('unlock')
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({
    summary: 'Remove the password from a PDF',
    body: PasswordDto,
    produces: MimeType.PDF,
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async unlock(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: PasswordDto,
  ): Promise<StreamableFile> {
    const pdf = await this.securityService.unlock(file.buffer, dto.password);
    return fileResponse(pdf, 'unlocked.pdf', MimeType.PDF);
  }
}
