import { EncryptedPDFError, PDFDict, PDFDocument, PDFName, PDFNumber } from '@cantoo/pdf-lib';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SecurityService } from './security.service';

async function pdfWithPages(count: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < count; i++) doc.addPage();
  return Buffer.from(await doc.save());
}

/** Reads the permission flags (/P) of an encrypted PDF without decrypting it. */
async function permissionFlags(pdf: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(pdf, { ignoreEncryption: true });
  const encrypt = doc.context.lookup(doc.context.trailerInfo.Encrypt, PDFDict);
  return encrypt.lookup(PDFName.of('P'), PDFNumber).asNumber();
}

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [SecurityService] }).compile();
    service = moduleRef.get(SecurityService);
  });

  describe('protect', () => {
    it('requires the password to open the PDF', async () => {
      const protectedPdf = await service.protect(await pdfWithPages(2), 'secret');

      await expect(PDFDocument.load(protectedPdf)).rejects.toThrow(EncryptedPDFError);
      const opened = await PDFDocument.load(protectedPdf, { password: 'secret' });
      expect(opened.getPageCount()).toBe(2);
    });

    it('still allows printing and copying once opened', async () => {
      const flags = await permissionFlags(await service.protect(await pdfWithPages(1), 'secret'));
      const PRINT = 1 << 2;
      const COPY = 1 << 4;
      expect(flags & PRINT).toBe(PRINT);
      expect(flags & COPY).toBe(COPY);
    });

    it('rejects a PDF that is already protected', async () => {
      const protectedPdf = Buffer.from(await service.protect(await pdfWithPages(1), 'secret'));
      await expect(service.protect(protectedPdf, 'other')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('unlock', () => {
    it('returns a PDF that opens without a password', async () => {
      const protectedPdf = Buffer.from(await service.protect(await pdfWithPages(3), 'secret'));

      const unlocked = await PDFDocument.load(await service.unlock(protectedPdf, 'secret'));

      expect(unlocked.getPageCount()).toBe(3);
    });

    it('rejects an incorrect password', async () => {
      const protectedPdf = Buffer.from(await service.protect(await pdfWithPages(1), 'secret'));
      await expect(service.unlock(protectedPdf, 'wrong')).rejects.toThrow(
        new BadRequestException('Incorrect password'),
      );
    });

    it('rejects a PDF that is not protected', async () => {
      await expect(service.unlock(await pdfWithPages(1), 'secret')).rejects.toThrow(
        new BadRequestException('This PDF is not password-protected'),
      );
    });

    it('rejects a file that is not a valid PDF', async () => {
      await expect(service.unlock(Buffer.from('not a pdf'), 'secret')).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
