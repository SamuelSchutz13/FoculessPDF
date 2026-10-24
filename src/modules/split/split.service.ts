import { PDFDocument } from '@cantoo/pdf-lib';
import { BadRequestException, Injectable } from '@nestjs/common';
import { zipSync } from 'fflate';
import { MAX_SPLIT_PARTS } from '../../common/constants/file.constants';
import { loadPdf } from '../../common/pdf/load-pdf';
import { parsePageRanges, toPageIndices } from '../../common/pdf/page-ranges';

@Injectable()
export class SplitService {
  /** Returns a ZIP with one PDF per range, e.g. "1-3,5" → part-1_pages-1-3.pdf, part-2_pages-5.pdf. */
  async split(file: Buffer, ranges: string): Promise<Uint8Array> {
    const source = await loadPdf(file);
    const parts = parsePageRanges(ranges, source.getPageCount());
    if (parts.length > MAX_SPLIT_PARTS) {
      throw new BadRequestException(`At most ${MAX_SPLIT_PARTS} ranges are allowed`);
    }

    const entries: Record<string, Uint8Array> = {};
    for (const [index, range] of parts.entries()) {
      const part = await PDFDocument.create();
      const pages = await part.copyPages(source, toPageIndices(range));
      for (const page of pages) part.addPage(page);

      const label = range.start === range.end ? range.start : `${range.start}-${range.end}`;
      entries[`part-${index + 1}_pages-${label}.pdf`] = await part.save();
    }

    // level 0: PDF streams are already compressed, deflating again only costs CPU.
    return zipSync(entries, { level: 0 });
  }
}
