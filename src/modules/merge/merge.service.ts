import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { loadPdf } from '../../common/pdf/load-pdf';

@Injectable()
export class MergeService {
  /** Concatenates all pages of the given PDFs, in order, into a single PDF. */
  async merge(files: Buffer[]): Promise<Uint8Array> {
    const merged = await PDFDocument.create();

    for (const [index, file] of files.entries()) {
      const source = await loadPdf(file, `File ${index + 1}`);
      const pages = await merged.copyPages(source, source.getPageIndices());
      for (const page of pages) merged.addPage(page);
    }

    return merged.save();
  }
}
