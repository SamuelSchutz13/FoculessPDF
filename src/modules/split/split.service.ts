import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class SplitService {
  /** Returns a ZIP with one PDF per range. */
  async split(_file: Buffer, _ranges: string): Promise<Uint8Array> {
    throw new NotImplementedException('Split is not implemented yet');
  }
}
