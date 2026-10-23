import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { loadPdf } from '../../common/pdf/load-pdf';
import { parsePageRanges, toPageIndices } from '../../common/pdf/page-ranges';

@Injectable()
export class OrganizeService {
  /** Builds a PDF with the pages in the given order ("3,1,2"); pages left out are removed. */
  async organize(file: Buffer, order: string): Promise<Uint8Array> {
    const source = await loadPdf(file);
    // "3,1,2" is also a valid range list, so the shared parser handles the bounds check.
    const indices = parsePageRanges(order, source.getPageCount()).flatMap(toPageIndices);

    const duplicate = indices.find((index, position) => indices.indexOf(index) !== position);
    if (duplicate !== undefined) {
      throw new BadRequestException(`Page ${duplicate + 1} appears more than once`);
    }

    const result = await PDFDocument.create();
    const pages = await result.copyPages(source, indices);
    for (const page of pages) result.addPage(page);

    return result.save();
  }
}
