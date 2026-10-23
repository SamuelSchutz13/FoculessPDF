import { Injectable, NotImplementedException } from '@nestjs/common';
import type { PageNumberPosition } from './dto/page-numbers.dto';

@Injectable()
export class PageNumbersService {
  async addPageNumbers(
    _file: Buffer,
    _position: PageNumberPosition,
    _startAt: number,
  ): Promise<Uint8Array> {
    throw new NotImplementedException('Page numbers is not implemented yet');
  }
}
