import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [SecurityService] }).compile();
    service = moduleRef.get(SecurityService);
  });

  it('protect is not implemented yet', async () => {
    await expect(service.protect(Buffer.alloc(0), 'secret')).rejects.toThrow(
      NotImplementedException,
    );
  });

  it('unlock is not implemented yet', async () => {
    await expect(service.unlock(Buffer.alloc(0), 'secret')).rejects.toThrow(
      NotImplementedException,
    );
  });
});
