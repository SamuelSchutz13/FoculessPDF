import { PDFDocument, PDFName, PDFNumber, PDFRawStream } from '@cantoo/pdf-lib';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CompressService } from './compress.service';
import { CompressionLevel } from './dto/compress.dto';

/** A noisy gradient: compresses about as badly as a real photo. */
function photoJpeg(width: number, height: number): Buffer {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1e3a8a');
  gradient.addColorStop(1, '#f59e0b');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  for (let i = 0; i < 4000; i++) {
    context.fillStyle = `hsl(${(i * 37) % 360} 70% 50% / 0.5)`;
    context.fillRect((i * 7919) % width, (i * 104729) % height, 12, 12);
  }
  return canvas.toBuffer('image/jpeg', 95);
}

async function pdfWithPhoto(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const image = await doc.embedJpg(photoJpeg(3000, 2000));
  doc.addPage([600, 400]).drawImage(image, { x: 0, y: 0, width: 600, height: 400 });
  return Buffer.from(await doc.save());
}

function images(doc: PDFDocument): PDFRawStream[] {
  return doc.context
    .enumerateIndirectObjects()
    .map(([, object]) => object)
    .filter(
      (object): object is PDFRawStream =>
        object instanceof PDFRawStream &&
        object.dict.get(PDFName.of('Subtype')) === PDFName.of('Image'),
    );
}

const dimension = (stream: PDFRawStream, key: string) =>
  stream.dict.lookup(PDFName.of(key), PDFNumber).asNumber();

describe('CompressService', () => {
  let service: CompressService;
  let photoPdf: Buffer;

  beforeAll(async () => {
    photoPdf = await pdfWithPhoto();
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [CompressService] }).compile();
    service = moduleRef.get(CompressService);
  });

  it('shrinks photos and keeps them decodable', async () => {
    const result = await service.compress(photoPdf, CompressionLevel.Recommended);

    expect(result.length).toBeLessThan(photoPdf.length / 2);
    const [image] = images(await PDFDocument.load(result));
    expect([dimension(image, 'Width'), dimension(image, 'Height')]).toEqual([1800, 1200]);
    const decoded = await loadImage(Buffer.from(image.getContents()));
    expect([decoded.width, decoded.height]).toEqual([1800, 1200]);
  });

  it('compresses more at stronger levels', async () => {
    const sizes = await Promise.all(
      [CompressionLevel.Low, CompressionLevel.Recommended, CompressionLevel.Extreme].map(
        async (level) => (await service.compress(photoPdf, level)).length,
      ),
    );
    expect(sizes[0]).toBeGreaterThan(sizes[1]);
    expect(sizes[1]).toBeGreaterThan(sizes[2]);
  });

  it('returns the original when nothing gets smaller', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const textOnly = Buffer.from(await doc.save());

    const result = await service.compress(textOnly, CompressionLevel.Extreme);

    expect(result.length).toBeLessThanOrEqual(textOnly.length);
    expect((await PDFDocument.load(result)).getPageCount()).toBe(1);
  });

  it('rejects a file that is not a valid PDF', async () => {
    await expect(
      service.compress(Buffer.from('not a pdf'), CompressionLevel.Recommended),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});
