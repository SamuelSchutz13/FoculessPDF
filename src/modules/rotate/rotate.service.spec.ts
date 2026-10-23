import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RotateService } from './rotate.service';

describe('RotateService', () => {
  let service: RotateService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [RotateService] }).compile();
    service = moduleRef.get(RotateService);
  });

  it('is not implemented yet', async () => {
    await expect(service.rotate(Buffer.alloc(0), 90)).rejects.toThrow(NotImplementedException);
  });
});
