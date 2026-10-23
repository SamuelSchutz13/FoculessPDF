import { Injectable, NotImplementedException } from '@nestjs/common';

@Injectable()
export class SecurityService {
  async protect(_file: Buffer, _password: string): Promise<Uint8Array> {
    throw new NotImplementedException('Protect is not implemented yet');
  }

  async unlock(_file: Buffer, _password: string): Promise<Uint8Array> {
    throw new NotImplementedException('Unlock is not implemented yet');
  }
}
