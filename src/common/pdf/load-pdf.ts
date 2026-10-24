import { EncryptedPDFError, PDFDocument } from '@cantoo/pdf-lib';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';

export async function loadPdf(
  file: Buffer,
  label = 'File',
  password?: string,
): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(file, { password });
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new UnprocessableEntityException(`${label} is password-protected; unlock it first`);
    }
    // @cantoo/pdf-lib throws a plain Error here, so its message is the only signal.
    if (
      password !== undefined &&
      error instanceof Error &&
      error.message === 'Password incorrect'
    ) {
      throw new BadRequestException('Incorrect password');
    }
    throw new UnprocessableEntityException(`${label} is not a valid PDF`);
  }
}
