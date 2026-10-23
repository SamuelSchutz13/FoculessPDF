import { NotImplementedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConvertService } from './convert.service';
import { ImageFormat } from './dto/pdf-to-image.dto';

describe('ConvertService', () => {
  let service: ConvertService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ providers: [ConvertService] }).compile();
    service = moduleRef.get(ConvertService);
  });

  it('imageToPdf is not implemented yet', async () => {
    await expect(service.imageToPdf([])).rejects.toThrow(NotImplementedException);
  });

  it('pdfToImage is not implemented yet', async () => {
    await expect(service.pdfToImage(Buffer.alloc(0), ImageFormat.Png)).rejects.toThrow(
      NotImplementedException,
    );
  });
});
