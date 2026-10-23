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
import { RotateDto } from './dto/rotate.dto';
import { RotateService } from './rotate.service';

@ApiTags('Rotate')
@Controller('rotate')
export class RotateController {
  constructor(private readonly rotateService: RotateService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({ summary: 'Rotate PDF pages', body: RotateDto, produces: MimeType.PDF })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async rotate(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: RotateDto,
  ): Promise<StreamableFile> {
    const pdf = await this.rotateService.rotate(file.buffer, dto.angle, dto.pages);
    return fileResponse(pdf, 'rotated.pdf', MimeType.PDF);
  }
}
