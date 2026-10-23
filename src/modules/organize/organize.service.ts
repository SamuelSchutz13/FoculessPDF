import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class OrganizeService {
  async organize(_file: Buffer, _order: string): Promise<Uint8Array> {
    throw new NotImplementedException('Organize is not implemented yet');
  }
}
