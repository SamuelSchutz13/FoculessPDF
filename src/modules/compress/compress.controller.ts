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
import { CompressService } from './compress.service';
import { CompressDto } from './dto/compress.dto';

@ApiTags('Compress')
@Controller('compress')
export class CompressController {
  constructor(private readonly compressService: CompressService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({ summary: 'Reduce PDF file size', body: CompressDto, produces: MimeType.PDF })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async compress(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: CompressDto,
  ): Promise<StreamableFile> {
    const pdf = await this.compressService.compress(file.buffer, dto.level);
    return fileResponse(pdf, 'compressed.pdf', MimeType.PDF);
  }
}
