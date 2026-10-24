import { degrees, rgb, StandardFonts } from '@cantoo/pdf-lib';
import { BadRequestException, Injectable } from '@nestjs/common';
import { loadPdf } from '../../common/pdf/load-pdf';

/** The text spans this share of the page diagonal, capped so short words don't get huge. */
const DIAGONAL_SHARE = 0.7;
const MAX_FONT_SIZE = 120;

@Injectable()
export class WatermarkService {
  /** Draws the text diagonally across the center of every page. */
  async watermark(file: Buffer, text: string, opacity: number): Promise<Uint8Array> {
    const doc = await loadPdf(file);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    // Standard PDF fonts only cover Latin characters (accents are fine, emoji/CJK are not),
    // and the library silently turns the rest into "?", so reject them explicitly.
    const unsupported = [...new Set(text)].filter(
      (char) => char !== '?' && font.encodeText(char).toString() === '<3F>',
    );
    if (unsupported.length) {
      throw new BadRequestException(
        `The watermark text contains unsupported characters: ${unsupported.join(' ')}`,
      );
    }
    const widthAtSizeOne = font.widthOfTextAtSize(text, 1);

    // shortcut: ignores the page's /Rotate, so on rotated pages the text follows the
    // unrotated page; upgrade by applying the inverse rotation when that shows up.
    for (const page of doc.getPages()) {
      const { x, y, width, height } = page.getCropBox();
      const angle = Math.atan2(height, width);
      const size = Math.min(
        (Math.hypot(width, height) * DIAGONAL_SHARE) / widthAtSizeOne,
        MAX_FONT_SIZE,
      );
      const textWidth = widthAtSizeOne * size;
      const textHeight = font.heightAtSize(size, { descender: false });

      // drawText rotates around the baseline start, so offset it to center the text.
      page.drawText(text, {
        x: x + width / 2 - (textWidth / 2) * Math.cos(angle) + (textHeight / 2) * Math.sin(angle),
        y: y + height / 2 - (textWidth / 2) * Math.sin(angle) - (textHeight / 2) * Math.cos(angle),
        size,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity,
        rotate: degrees((angle * 180) / Math.PI),
      });
    }

    return doc.save();
  }
}
