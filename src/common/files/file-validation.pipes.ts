import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { MAX_FILE_SIZE_BYTES, MimeType } from '../constants/file.constants';

const buildFilePipe = (fileType: string | RegExp) =>
  new ParseFilePipeBuilder()
    .addFileTypeValidator({ fileType })
    .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES })
    .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

export const PdfFilePipe = buildFilePipe(MimeType.PDF);
export const ImageFilePipe = buildFilePipe(/^image\/(jpeg|png)$/);
