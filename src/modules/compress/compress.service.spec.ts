import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CompressService } from './compress.service';
import { CompressionLevel } from './dto/compress.dto';

describe('CompressService', () => {
  let service: CompressService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [CompressService] }).compile();
    service = moduleRef.get(CompressService);
  });

  it('is not implemented yet', async () => {
    await expect(service.compress(Buffer.alloc(0), CompressionLevel.Recommended)).rejects.toThrow(
      NotImplementedException,
    );
  });
});
