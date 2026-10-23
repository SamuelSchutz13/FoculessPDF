import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { MAX_FILE_SIZE_BYTES, MimeType } from '../constants/file.constants';

// Nest types the file as a platform-agnostic IFile; with Express it is a Multer file.
const nameOf = (file: unknown) => {
  const name = (file as Express.Multer.File | undefined)?.originalname;
  return name ? `"${name}"` : 'File';
};

// The validator checks the file's magic bytes, so the default message (which shows the
// client-declared MIME type) can read "got application/pdf, expected application/pdf".
const buildFilePipe = (fileType: string | RegExp, expected: string) =>
  new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType,
      errorMessage: ({ file }) => `${nameOf(file)} is not a valid ${expected} file`,
    })
    .addMaxSizeValidator({
      maxSize: MAX_FILE_SIZE_BYTES,
      errorMessage: ({ file }) =>
        `${nameOf(file)} exceeds the ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB limit`,
    })
    .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });

export const PdfFilePipe = buildFilePipe(MimeType.PDF, 'PDF');
export const ImageFilePipe = buildFilePipe(/^image\/(jpeg|png)$/, 'JPEG or PNG');
