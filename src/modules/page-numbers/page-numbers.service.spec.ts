import { inflateSync } from 'node:zlib';
import { PDFDocument } from '@cantoo/pdf-lib';
import { UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PageNumberPosition } from './dto/page-numbers.dto';
import { PageNumbersService } from './page-numbers.service';

async function pdfWithPages(count: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < count; i++) doc.addPage([600, 800]);
  return Buffer.from(await doc.save());
}

/** For each page, the text drawn and its position. */
async function drawnText(pdf: Uint8Array) {
  const doc = await PDFDocument.load(pdf);
  const raw = Buffer.from(await doc.save({ useObjectStreams: false })).toString('latin1');
  return [...raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)]
    .map((match) => {
      try {
        return inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1');
      } catch {
        return '';
      }
    })
    .filter((content) => content.includes('Tj'))
    .map((content) => {
      const [, hex] = /<([0-9A-F]+)> Tj/i.exec(content) ?? [];
      // pdf-lib positions text with a text matrix: "1 0 0 1 <x> <y> Tm".
      const [, x, y] = /([\d.]+) ([\d.]+) Tm/.exec(content) ?? [];
      return { text: Buffer.from(hex, 'hex').toString('latin1'), x: Number(x), y: Number(y) };
    });
}

describe('PageNumbersService', () => {
  let service: PageNumbersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [PageNumbersService] }).compile();
    service = moduleRef.get(PageNumbersService);
  });

  it('numbers every page starting at the given number', async () => {
    const result = await service.addPageNumbers(
      await pdfWithPages(3),
      PageNumberPosition.BottomCenter,
      5,
    );
    expect((await drawnText(result)).map((t) => t.text)).toEqual(['5', '6', '7']);
  });

  it('places the number at the requested corner', async () => {
    const [bottomLeft] = await drawnText(
      await service.addPageNumbers(await pdfWithPages(1), PageNumberPosition.BottomLeft, 1),
    );
    const [topRight] = await drawnText(
      await service.addPageNumbers(await pdfWithPages(1), PageNumberPosition.TopRight, 1),
    );

    expect(bottomLeft).toMatchObject({ x: 28, y: 28 });
    expect(topRight.x).toBeGreaterThan(500);
    expect(topRight.y).toBeGreaterThan(700);
  });

  it('rejects a file that is not a valid PDF', async () => {
    await expect(
      service.addPageNumbers(Buffer.from('not a pdf'), PageNumberPosition.BottomCenter, 1),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});
