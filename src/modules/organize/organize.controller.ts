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
import { OrganizeDto } from './dto/organize.dto';
import { OrganizeService } from './organize.service';

@ApiTags('Organize')
@Controller('organize')
export class OrganizeController {
  constructor(private readonly organizeService: OrganizeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({
    summary: 'Reorder or remove PDF pages',
    body: OrganizeDto,
    produces: MimeType.PDF,
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async organize(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: OrganizeDto,
  ): Promise<StreamableFile> {
    const pdf = await this.organizeService.organize(file.buffer, dto.order);
    return fileResponse(pdf, 'organized.pdf', MimeType.PDF);
  }
}
