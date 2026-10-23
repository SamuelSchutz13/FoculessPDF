import { Injectable, NotImplementedException } from '@nestjs/common';
import type { CompressionLevel } from './dto/compress.dto';

@Injectable()
export class CompressService {
  async compress(_file: Buffer, _level: CompressionLevel): Promise<Uint8Array> {
    throw new NotImplementedException('Compress is not implemented yet');
  }
}
