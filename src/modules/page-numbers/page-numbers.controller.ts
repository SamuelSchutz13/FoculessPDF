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
import { PageNumbersDto } from './dto/page-numbers.dto';
import { PageNumbersService } from './page-numbers.service';

@ApiTags('Page numbers')
@Controller('page-numbers')
export class PageNumbersController {
  constructor(private readonly pageNumbersService: PageNumbersService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({ summary: 'Add page numbers', body: PageNumbersDto, produces: MimeType.PDF })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async addPageNumbers(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: PageNumbersDto,
  ): Promise<StreamableFile> {
    const pdf = await this.pageNumbersService.addPageNumbers(
      file.buffer,
      dto.position,
      dto.startAt,
    );
    return fileResponse(pdf, 'numbered.pdf', MimeType.PDF);
  }
}
