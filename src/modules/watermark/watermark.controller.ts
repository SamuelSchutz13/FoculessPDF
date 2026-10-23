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
import { WatermarkDto } from './dto/watermark.dto';
import { WatermarkService } from './watermark.service';

@ApiTags('Watermark')
@Controller('watermark')
export class WatermarkController {
  constructor(private readonly watermarkService: WatermarkService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({ summary: 'Add a text watermark', body: WatermarkDto, produces: MimeType.PDF })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async watermark(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: WatermarkDto,
  ): Promise<StreamableFile> {
    const pdf = await this.watermarkService.watermark(file.buffer, dto.text, dto.opacity);
    return fileResponse(pdf, 'watermarked.pdf', MimeType.PDF);
  }
}
