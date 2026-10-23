import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class MergeService {
  async merge(_files: Buffer[]): Promise<Uint8Array> {
    throw new NotImplementedException('Merge is not implemented yet');
  }
}
