import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { MAX_FILES, MimeType, uploadOptions } from '../../common/constants/file.constants';
import { ApiFileOperation } from '../../common/decorators/api-file-operation.decorator';
import { fileResponse } from '../../common/files/file-response';
import { ImageFilePipe, PdfFilePipe } from '../../common/files/file-validation.pipes';
import { ConvertService } from './convert.service';
import { ImageToPdfDto } from './dto/image-to-pdf.dto';
import { PdfToImageDto } from './dto/pdf-to-image.dto';

@ApiTags('Convert')
@Controller('convert')
export class ConvertController {
  constructor(private readonly convertService: ConvertService) {}

  @Post('image-to-pdf')
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({
    summary: 'Convert JPEG/PNG images to a PDF',
    body: ImageToPdfDto,
    produces: MimeType.PDF,
  })
  @UseInterceptors(FilesInterceptor('files', MAX_FILES, uploadOptions))
  async imageToPdf(
    @UploadedFiles(ImageFilePipe) files: Express.Multer.File[],
  ): Promise<StreamableFile> {
    const pdf = await this.convertService.imageToPdf(files.map((file) => file.buffer));
    return fileResponse(pdf, 'images.pdf', MimeType.PDF);
  }

  @Post('pdf-to-image')
  @HttpCode(HttpStatus.OK)
  @ApiFileOperation({
    summary: 'Convert each PDF page to an image (ZIP)',
    body: PdfToImageDto,
    produces: MimeType.ZIP,
  })
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async pdfToImage(
    @UploadedFile(PdfFilePipe) file: Express.Multer.File,
    @Body() dto: PdfToImageDto,
  ): Promise<StreamableFile> {
    const zip = await this.convertService.pdfToImage(file.buffer, dto.format);
    return fileResponse(zip, 'images.zip', MimeType.ZIP);
  }
}
