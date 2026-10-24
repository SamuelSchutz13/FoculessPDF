import { rgb, StandardFonts } from '@cantoo/pdf-lib';
import { Injectable } from '@nestjs/common';
import { loadPdf } from '../../common/pdf/load-pdf';
import type { PageNumberPosition } from './dto/page-numbers.dto';

const FONT_SIZE = 11;
/** Distance from the page edges, in points (~1 cm). */
const MARGIN = 28;

@Injectable()
export class PageNumbersService {
  /** Writes "1", "2", … on every page, starting at `startAt`. */
  async addPageNumbers(
    file: Buffer,
    position: PageNumberPosition,
    startAt: number,
  ): Promise<Uint8Array> {
    const doc = await loadPdf(file);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const [vertical, horizontal] = position.split('-') as [
      'top' | 'bottom',
      'left' | 'center' | 'right',
    ];

    for (const [index, page] of doc.getPages().entries()) {
      const label = String(startAt + index);
      const textWidth = font.widthOfTextAtSize(label, FONT_SIZE);
      // CropBox is the visible area; its origin is not always (0, 0).
      const { x, y, width, height } = page.getCropBox();

      page.drawText(label, {
        x: {
          left: x + MARGIN,
          center: x + (width - textWidth) / 2,
          right: x + width - MARGIN - textWidth,
        }[horizontal],
        y: vertical === 'bottom' ? y + MARGIN : y + height - MARGIN - FONT_SIZE,
        size: FONT_SIZE,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }

    return doc.save();
  }
}
