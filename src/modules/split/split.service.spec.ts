import { PDFDocument } from '@cantoo/pdf-lib';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { unzipSync } from 'fflate';
import { SplitService } from './split.service';

/** Builds a PDF whose pages have the given widths, so page order can be asserted. */
async function pdfWithPages(...widths: number[]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (const width of widths) doc.addPage([width, 800]);
  return Buffer.from(await doc.save());
}

const widthsOf = async (pdf: Uint8Array) =>
  (await PDFDocument.load(pdf)).getPages().map((page) => page.getWidth());

describe('SplitService', () => {
  let service: SplitService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [SplitService] }).compile();
    service = moduleRef.get(SplitService);
  });

  it('returns a ZIP with one PDF per range', async () => {
    const file = await pdfWithPages(100, 200, 300, 400, 500);

    const files = unzipSync(await service.split(file, '1-2,4'));

    expect(Object.keys(files)).toEqual(['part-1_pages-1-2.pdf', 'part-2_pages-4.pdf']);
    expect(await widthsOf(files['part-1_pages-1-2.pdf'])).toEqual([100, 200]);
    expect(await widthsOf(files['part-2_pages-4.pdf'])).toEqual([400]);
  });

  it('rejects ranges outside the document', async () => {
    await expect(service.split(await pdfWithPages(100, 200), '1-3')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects too many ranges', async () => {
    const ranges = Array(101).fill('1').join(',');
    await expect(service.split(await pdfWithPages(100), ranges)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a file that is not a valid PDF', async () => {
    await expect(service.split(Buffer.from('not a pdf'), '1')).rejects.toThrow(
      UnprocessableEntityException,
    );
  });
});
