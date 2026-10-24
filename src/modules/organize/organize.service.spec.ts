import { PDFDocument } from '@cantoo/pdf-lib';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrganizeService } from './organize.service';

/** Builds a PDF whose pages have the given widths, so page order can be asserted. */
async function pdfWithPages(...widths: number[]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (const width of widths) doc.addPage([width, 800]);
  return Buffer.from(await doc.save());
}

const widthsOf = async (pdf: Uint8Array) =>
  (await PDFDocument.load(pdf)).getPages().map((page) => page.getWidth());

describe('OrganizeService', () => {
  let service: OrganizeService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [OrganizeService] }).compile();
    service = moduleRef.get(OrganizeService);
  });

  it('reorders pages', async () => {
    const result = await service.organize(await pdfWithPages(100, 200, 300), '3,1,2');
    expect(await widthsOf(result)).toEqual([300, 100, 200]);
  });

  it('removes pages left out of the order', async () => {
    const result = await service.organize(await pdfWithPages(100, 200, 300, 400), '4,2');
    expect(await widthsOf(result)).toEqual([400, 200]);
  });

  it('rejects a page listed twice', async () => {
    await expect(service.organize(await pdfWithPages(100, 200), '1,2,1')).rejects.toThrow(
      new BadRequestException('Page 1 appears more than once'),
    );
  });

  it('rejects pages outside the document', async () => {
    await expect(service.organize(await pdfWithPages(100, 200), '3,1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a file that is not a valid PDF', async () => {
    await expect(service.organize(Buffer.from('not a pdf'), '1')).rejects.toThrow(
      UnprocessableEntityException,
    );
  });
});
