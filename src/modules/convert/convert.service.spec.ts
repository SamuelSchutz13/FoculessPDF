import { inflateSync } from 'node:zlib';
import { PDFDocument } from '@cantoo/pdf-lib';
import { NotImplementedException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { png, TINY_JPEG, withExifOrientation } from '../../../test/fixtures/images';
import { ConvertService } from './convert.service';
import { ImageFormat } from './dto/pdf-to-image.dto';

type Matrix = [number, number, number, number, number, number];

/** Composes PDF "a b c d e f cm" operators: each new one is applied before the current CTM. */
const compose = ([a, b, c, d, e, f]: Matrix, [A, B, C, D, E, F]: Matrix): Matrix => [
  a * A + b * C,
  a * B + b * D,
  c * A + d * C,
  c * B + d * D,
  e * A + f * C + E,
  e * B + f * D + F,
];

/** Where the first page's image lands: its transform and the bounding box of the unit square. */
async function placedImage(pdf: Uint8Array) {
  const raw = Buffer.from(
    await (await PDFDocument.load(pdf)).save({ useObjectStreams: false }),
  ).toString('latin1');
  for (const match of raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g)) {
    let content: string;
    try {
      content = inflateSync(Buffer.from(match[1], 'latin1')).toString('latin1');
    } catch {
      continue;
    }
    if (!content.includes(' Do')) continue;

    const ops = [...content.matchAll(/((?:[-\d.e]+ ){6})cm/g)];
    const matrix = ops
      .map((op) => op[1].trim().split(' ').map(Number) as Matrix)
      .reduce((ctm, op) => compose(op, ctm), [1, 0, 0, 1, 0, 0] as Matrix);
    const [a, b, c, d, e, f] = matrix;
    const xs = [e, e + a, e + c, e + a + c];
    const ys = [f, f + b, f + d, f + b + d];
    return {
      rotation: [a, b, c, d].map((n) => Math.sign(Math.round(n * 1000)) || 0),
      box: {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      },
    };
  }
  throw new Error('no image drawn');
}

describe('ConvertService', () => {
  let service: ConvertService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [ConvertService] }).compile();
    service = moduleRef.get(ConvertService);
  });

  describe('imageToPdf', () => {
    it('creates one A4 page per image, turned to the image orientation', async () => {
      const result = await service.imageToPdf([png(2000, 1000), png(100, 300), TINY_JPEG]);

      const pages = (await PDFDocument.load(result)).getPages().map((page) => page.getSize());
      expect(pages.map(({ width, height }) => [Math.round(width), Math.round(height)])).toEqual([
        [842, 595],
        [595, 842],
        [595, 842],
      ]);
    });

    it('fits large images inside the margins, centered', async () => {
      const { box } = await placedImage(await service.imageToPdf([png(4000, 2000)]));

      // Landscape A4 is 841.89 × 595.28; 20 pt margins; aspect ratio 2:1 kept.
      expect(box.width).toBeCloseTo(801.89, 1);
      expect(box.height).toBeCloseTo(400.95, 1);
      expect(box.x).toBeCloseTo(20, 1);
      expect(box.y).toBeCloseTo((595.28 - 400.95) / 2, 1);
    });

    it('keeps small images at their own size', async () => {
      const { box } = await placedImage(await service.imageToPdf([png(100, 50)]));
      expect([box.width, box.height]).toEqual([100, 50]);
    });

    it.each([
      [1, [1, 0, 0, 1]],
      [3, [-1, 0, 0, -1]], // upside down
      [6, [0, -1, 1, 0]], // 90° clockwise
      [8, [0, 1, -1, 0]], // 90° counter-clockwise
    ])(
      'applies EXIF orientation %i and keeps the image centered',
      async (orientation, rotation) => {
        const { rotation: actual, box } = await placedImage(
          await service.imageToPdf([withExifOrientation(TINY_JPEG, orientation)]),
        );

        expect(actual).toEqual(rotation);
        // A 1×1 image on portrait A4 must stay exactly in the middle whatever the rotation.
        expect(box.x).toBeCloseTo((595.28 - 1) / 2, 2);
        expect(box.y).toBeCloseTo((841.89 - 1) / 2, 2);
      },
    );

    it('rejects an image that cannot be decoded, pointing to its position', async () => {
      const corrupt = Buffer.concat([Buffer.from('89504e47', 'hex'), Buffer.from('garbage')]);
      await expect(service.imageToPdf([TINY_JPEG, corrupt])).rejects.toThrow(
        new UnprocessableEntityException('Image 2 is not a valid JPEG or PNG'),
      );
    });
  });

  it('pdfToImage is not implemented yet', async () => {
    await expect(service.pdfToImage(Buffer.alloc(0), ImageFormat.Png)).rejects.toThrow(
      NotImplementedException,
    );
  });
});
