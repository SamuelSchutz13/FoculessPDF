import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { MAX_FILES, MimeType, uploadOptions } from '../../common/constants/file.constants';
import { ApiFileOperation } from '../../common/decorators/api-file-operation.decorator';
import { fileResponse } from '../../common/files/file-response';
import { PdfFilePipe } from '../../common/files/file-validation.pipes';
import { MergeDto } from './dto/merge.dto';
import { MergeService } from './merge.service';

@ApiTags('Merge')
@Controller('merge')
export class MergeController {
  constructor(private readonly mergeService: MergeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({ summary: 'Merge PDFs into one', body: MergeDto, produces: MimeType.PDF })
  @UseInterceptors(FilesInterceptor('files', MAX_FILES, uploadOptions))
  async merge(@UploadedFiles(PdfFilePipe) files: Express.Multer.File[]): Promise<StreamableFile> {
    if (files.length < 2) throw new BadRequestException('At least 2 PDF files are required');
    const pdf = await this.mergeService.merge(files.map((file) => file.buffer));
    return fileResponse(pdf, 'merged.pdf', MimeType.PDF);
  }
}
