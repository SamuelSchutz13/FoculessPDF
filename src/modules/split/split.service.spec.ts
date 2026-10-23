import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SplitService } from './split.service';

describe('SplitService', () => {
  let service: SplitService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [SplitService] }).compile();
    service = moduleRef.get(SplitService);
  });

  it('is not implemented yet', async () => {
    await expect(service.split(Buffer.alloc(0), '1')).rejects.toThrow(NotImplementedException);
  });
});
