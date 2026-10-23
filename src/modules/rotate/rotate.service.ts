import { Injectable } from '@nestjs/common';
import { degrees } from 'pdf-lib';
import { loadPdf } from '../../common/pdf/load-pdf';
import { parsePageRanges, toPageIndices } from '../../common/pdf/page-ranges';
import type { RotationAngle } from './dto/rotate.dto';

@Injectable()
export class RotateService {
  /** Rotates the given pages (all when omitted) clockwise, on top of their current rotation. */
  async rotate(file: Buffer, angle: RotationAngle, pages?: string): Promise<Uint8Array> {
    const doc = await loadPdf(file);
    const indices = pages
      ? parsePageRanges(pages, doc.getPageCount()).flatMap(toPageIndices)
      : doc.getPageIndices();

    // Set: overlapping ranges like "1-3,2" must not rotate page 2 twice.
    for (const index of new Set(indices)) {
      const page = doc.getPage(index);
      const current = page.getRotation().angle;
      page.setRotation(degrees((((current + angle) % 360) + 360) % 360));
    }

    return doc.save();
  }
}
