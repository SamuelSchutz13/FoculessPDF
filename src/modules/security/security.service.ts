import { EncryptedPDFError, PDFDocument } from '@cantoo/pdf-lib';
import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { loadPdf } from '../../common/pdf/load-pdf';

// The password only guards opening the file; without explicit permissions,
// encrypt() would also block printing, copying and form filling.
const ALL_PERMISSIONS = {
  printing: 'highResolution',
  modifying: true,
  copying: true,
  annotating: true,
  fillingForms: true,
  contentAccessibility: true,
  documentAssembly: true,
} as const;

@Injectable()
export class SecurityService {
  /** Encrypts the PDF with AES-256; the password is required to open it. */
  async protect(file: Buffer, password: string): Promise<Uint8Array> {
    const doc = await loadPdf(file);
    doc.encrypt({ userPassword: password, ownerPassword: password, permissions: ALL_PERMISSIONS });
    return doc.save();
  }

  /** Returns a copy of the PDF that opens without a password. */
  async unlock(file: Buffer, password: string): Promise<Uint8Array> {
    await this.assertProtected(file);
    const source = await loadPdf(file, 'File', password);

    // Saving the decrypted document would keep its old /Encrypt reference and the
    // result would not open, so the pages go into a clean PDF instead.
    const unlocked = await PDFDocument.create();
    const pages = await unlocked.copyPages(source, source.getPageIndices());
    for (const page of pages) unlocked.addPage(page);

    return unlocked.save();
  }

  // Loading with a password also succeeds for unprotected files, so check first.
  private async assertProtected(file: Buffer): Promise<void> {
    try {
      await PDFDocument.load(file);
    } catch (error) {
      if (error instanceof EncryptedPDFError) return;
      throw new UnprocessableEntityException('File is not a valid PDF');
    }
    throw new BadRequestException('This PDF is not password-protected');
  }
}
