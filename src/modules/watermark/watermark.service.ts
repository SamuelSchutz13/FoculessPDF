import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class WatermarkService {
  async watermark(_file: Buffer, _text: string, _opacity: number): Promise<Uint8Array> {
    throw new NotImplementedException('Watermark is not implemented yet');
  }
}
