import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MergeService } from './merge.service';

describe('MergeService', () => {
  let service: MergeService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [MergeService] }).compile();
    service = moduleRef.get(MergeService);
  });

  it('is not implemented yet', async () => {
    await expect(service.merge([])).rejects.toThrow(NotImplementedException);
  });
});
