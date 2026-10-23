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
import { SplitDto } from './dto/split.dto';
import { SplitService } from './split.service';

@ApiTags('Split')
@Controller('split')
export class SplitController {
  constructor(private readonly splitService: SplitService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({
    summary: 'Split a PDF by page ranges',
    body: SplitDto,
    produces: MimeType.ZIP,
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async split(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: SplitDto,
  ): Promise<StreamableFile> {
    const zip = await this.splitService.split(file.buffer, dto.ranges);
    return fileResponse(zip, 'split.zip', MimeType.ZIP);
  }
}
