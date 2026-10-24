import { PDFDocument } from '@cantoo/pdf-lib';
import { UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MergeService } from './merge.service';

/** Builds a PDF whose pages have the given widths, so page order can be asserted. */
async function pdfWithPages(...widths: number[]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (const width of widths) doc.addPage([width, 800]);
  return Buffer.from(await doc.save());
}

describe('MergeService', () => {
  let service: MergeService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [MergeService] }).compile();
    service = moduleRef.get(MergeService);
  });

  it('merges all pages keeping file and page order', async () => {
    const result = await service.merge([await pdfWithPages(100, 200), await pdfWithPages(300)]);

    const merged = await PDFDocument.load(result);
    expect(merged.getPages().map((page) => page.getWidth())).toEqual([100, 200, 300]);
  });

  it('rejects a file that is not a valid PDF, pointing to its position', async () => {
    const files = [await pdfWithPages(100), Buffer.from('not a pdf')];

    await expect(service.merge(files)).rejects.toThrow(
      new UnprocessableEntityException('File 2 is not a valid PDF'),
    );
  });
});
