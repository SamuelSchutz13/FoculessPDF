import { BadRequestException, StreamableFile } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MergeController } from './merge.controller';
import { MergeService } from './merge.service';

const pdf = (name: string) =>
  ({ originalname: name, buffer: Buffer.from(name) }) as Express.Multer.File;

describe('MergeController', () => {
  let controller: MergeController;
  const mergeService = { merge: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MergeController],
      providers: [{ provide: MergeService, useValue: mergeService }],
    }).compile();

    controller = moduleRef.get(MergeController);
    mergeService.merge.mockReset();
  });

  it('rejects fewer than 2 files', async () => {
    await expect(controller.merge([pdf('a.pdf')])).rejects.toThrow(BadRequestException);
    expect(mergeService.merge).not.toHaveBeenCalled();
  });

  it('passes file buffers in order and returns a PDF download', async () => {
    mergeService.merge.mockResolvedValue(new Uint8Array([1, 2, 3]));

    const result = await controller.merge([pdf('a.pdf'), pdf('b.pdf')]);

    expect(mergeService.merge).toHaveBeenCalledWith([Buffer.from('a.pdf'), Buffer.from('b.pdf')]);
    expect(result).toBeInstanceOf(StreamableFile);
    expect(result.getHeaders()).toMatchObject({
      type: 'application/pdf',
      disposition: 'attachment; filename="merged.pdf"',
    });
  });
});
