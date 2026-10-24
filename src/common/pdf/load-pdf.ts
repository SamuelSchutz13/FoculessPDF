import { EncryptedPDFError, PDFDocument } from '@cantoo/pdf-lib';
import { UnprocessableEntityException } from '@nestjs/common';

export async function loadPdf(file: Buffer, label = 'File'): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(file);
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new UnprocessableEntityException(`${label} is password-protected; unlock it first`);
    }
    throw new UnprocessableEntityException(`${label} is not a valid PDF`);
  }
}
