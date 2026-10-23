import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WatermarkService } from './watermark.service';

describe('WatermarkService', () => {
  let service: WatermarkService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [WatermarkService] }).compile();
    service = moduleRef.get(WatermarkService);
  });

  it('is not implemented yet', async () => {
    await expect(service.watermark(Buffer.alloc(0), 'DRAFT', 0.5)).rejects.toThrow(
      NotImplementedException,
    );
  });
});
