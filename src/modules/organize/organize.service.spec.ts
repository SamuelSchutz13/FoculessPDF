import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OrganizeService } from './organize.service';

describe('OrganizeService', () => {
  let service: OrganizeService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [OrganizeService] }).compile();
    service = moduleRef.get(OrganizeService);
  });

  it('is not implemented yet', async () => {
    await expect(service.organize(Buffer.alloc(0), '1')).rejects.toThrow(NotImplementedException);
  });
});
