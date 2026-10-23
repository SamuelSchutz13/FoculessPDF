import { Injectable, NotImplementedException } from '@nestjs/common';
import type { RotationAngle } from './dto/rotate.dto';

@Injectable()
export class RotateService {
  async rotate(_file: Buffer, _angle: RotationAngle, _pages?: string): Promise<Uint8Array> {
    throw new NotImplementedException('Rotate is not implemented yet');
  }
}
