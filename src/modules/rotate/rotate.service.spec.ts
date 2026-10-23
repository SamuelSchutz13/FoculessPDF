import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { degrees, PDFDocument } from 'pdf-lib';
import { RotateService } from './rotate.service';

/** Builds a PDF whose pages start with the given rotations. */
async function pdfWithRotations(...rotations: number[]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (const rotation of rotations) doc.addPage().setRotation(degrees(rotation));
  return Buffer.from(await doc.save());
}

const rotationsOf = async (pdf: Uint8Array) =>
  (await PDFDocument.load(pdf)).getPages().map((page) => page.getRotation().angle);

describe('RotateService', () => {
  let service: RotateService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [RotateService] }).compile();
    service = moduleRef.get(RotateService);
  });

  it('rotates every page when no pages are given', async () => {
    const result = await service.rotate(await pdfWithRotations(0, 0, 0), 90);
    expect(await rotationsOf(result)).toEqual([90, 90, 90]);
  });

  it('rotates only the selected pages, once even if ranges overlap', async () => {
    const result = await service.rotate(await pdfWithRotations(0, 0, 0, 0), 180, '1-2,2');
    expect(await rotationsOf(result)).toEqual([180, 180, 0, 0]);
  });

  it('adds to the current rotation and wraps at 360', async () => {
    const result = await service.rotate(await pdfWithRotations(270, 90), 180);
    expect(await rotationsOf(result)).toEqual([90, 270]);
  });

  it('rejects pages outside the document', async () => {
    await expect(service.rotate(await pdfWithRotations(0), 90, '2')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a file that is not a valid PDF', async () => {
    await expect(service.rotate(Buffer.from('not a pdf'), 90)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });
});
