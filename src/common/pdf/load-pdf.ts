import { UnprocessableEntityException } from '@nestjs/common';
import { EncryptedPDFError, PDFDocument } from 'pdf-lib';

/**
 * Parses an uploaded PDF, turning parser errors into 422 instead of 500.
 * The upload pipe only checks the file header, so the body may still be corrupt or encrypted.
 */
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
