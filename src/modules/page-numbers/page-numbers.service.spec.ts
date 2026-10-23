import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PageNumberPosition } from './dto/page-numbers.dto';
import { PageNumbersService } from './page-numbers.service';

describe('PageNumbersService', () => {
  let service: PageNumbersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [PageNumbersService] }).compile();
    service = moduleRef.get(PageNumbersService);
  });

  it('is not implemented yet', async () => {
    await expect(
      service.addPageNumbers(Buffer.alloc(0), PageNumberPosition.BottomCenter, 1),
    ).rejects.toThrow(NotImplementedException);
  });
});
