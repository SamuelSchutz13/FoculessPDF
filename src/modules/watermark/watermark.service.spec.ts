import { inflateSync } from 'node:zlib';
import { PDFDocument } from '@cantoo/pdf-lib';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WatermarkService } from './watermark.service';

async function pdfWithPages(count: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < count; i++) doc.addPage([600, 800]);
  return Buffer.from(await doc.save({ useObjectStreams: false }));
}

/** Decompressed content streams of the PDF, where drawing operators live. */
function contentStreams(pdf: Uint8Array): string[] {
  const raw = Buffer.from(pdf).toString('latin1');
  return [...raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)].map((match) => {
    try {
      return inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1');
    } catch {
      return match[1];
    }
  });
}

const hex = (text: string) => Buffer.from(text, 'latin1').toString('hex').toUpperCase();

describe('WatermarkService', () => {
  let service: WatermarkService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [WatermarkService] }).compile();
    service = moduleRef.get(WatermarkService);
  });

  it('draws the text on every page', async () => {
    const result = await service.watermark(await pdfWithPages(2), 'DRAFT', 0.5);

    const streams = contentStreams(
      await PDFDocument.load(result).then((d) => d.save({ useObjectStreams: false })),
    );
    const withText = streams.filter((s) => s.toUpperCase().includes(`<${hex('DRAFT')}>`));
    expect(withText).toHaveLength(2);
  });

  it('accepts accented Latin text', async () => {
    await expect(
      service.watermark(await pdfWithPages(1), 'Confidencial – não copiar', 0.3),
    ).resolves.toBeInstanceOf(Uint8Array);
  });

  it('rejects characters the standard font cannot draw', async () => {
    await expect(service.watermark(await pdfWithPages(1), '机密 🔒', 0.5)).rejects.toThrow(
      new BadRequestException('The watermark text contains unsupported characters: 机 密 🔒'),
    );
  });

  it('rejects a file that is not a valid PDF', async () => {
    await expect(service.watermark(Buffer.from('not a pdf'), 'DRAFT', 0.5)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });
});
