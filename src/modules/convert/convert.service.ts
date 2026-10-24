import { degrees, PDFDocument, type PDFImage } from '@cantoo/pdf-lib';
import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { zipSync } from 'fflate';
import { loadPdf } from '../../common/pdf/load-pdf';
import { ImageFormat } from './dto/pdf-to-image.dto';
import { readJpegOrientation } from './jpeg-orientation';
import { renderPages } from './render-pages';

/** A4 portrait, in points. Landscape images get the page turned sideways. */
const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 20;

/** Every rendered page stays in memory until the ZIP is built, so cap the page count. */
const MAX_RENDERED_PAGES = 100;
const JPEG_QUALITY = 85;

const isPng = (bytes: Buffer) => bytes.subarray(0, 4).toString('hex') === '89504e47';

@Injectable()
export class ConvertService {
  /** One A4 page per image, in upload order, the image fitted and centered. */
  async imageToPdf(images: Buffer[]): Promise<Uint8Array> {
    const doc = await PDFDocument.create();

    for (const [index, bytes] of images.entries()) {
      const image = await this.embedImage(doc, bytes, index + 1);
      // EXIF 5–8 mean the photo is stored sideways; 3 and 4 upside down.
      const orientation = isPng(bytes) ? 1 : readJpegOrientation(bytes);
      const sideways = orientation >= 5;
      const shown = sideways
        ? { width: image.height, height: image.width }
        : { width: image.width, height: image.height };

      const page =
        shown.width > shown.height
          ? doc.addPage([A4.height, A4.width])
          : doc.addPage([A4.width, A4.height]);
      const { width: pageWidth, height: pageHeight } = page.getSize();
      // Fit inside the margins, never upscaling small images.
      const scale = Math.min(
        (pageWidth - 2 * MARGIN) / shown.width,
        (pageHeight - 2 * MARGIN) / shown.height,
        1,
      );
      const box = {
        x: (pageWidth - shown.width * scale) / 2,
        y: (pageHeight - shown.height * scale) / 2,
        width: shown.width * scale,
        height: shown.height * scale,
      };
      const width = image.width * scale;
      const height = image.height * scale;

      // drawImage rotates around its (x, y) corner, so each rotation starts from a different corner.
      // shortcut: mirrored orientations (2, 4, 5, 7) are drawn as their unmirrored rotation; they
      // are very rare in camera output.
      if (orientation === 3 || orientation === 4) {
        page.drawImage(image, {
          x: box.x + box.width,
          y: box.y + box.height,
          width,
          height,
          rotate: degrees(180),
        });
      } else if (orientation === 6 || orientation === 5) {
        page.drawImage(image, {
          x: box.x,
          y: box.y + box.height,
          width,
          height,
          rotate: degrees(-90),
        });
      } else if (orientation === 8 || orientation === 7) {
        page.drawImage(image, {
          x: box.x + box.width,
          y: box.y,
          width,
          height,
          rotate: degrees(90),
        });
      } else {
        page.drawImage(image, { ...box });
      }
    }

    return doc.save();
  }

  /** Returns a ZIP with one image per page: page-1.jpg, page-2.jpg, … */
  async pdfToImage(file: Buffer, format: ImageFormat): Promise<Uint8Array> {
    // Parsing with pdf-lib first gives the same 422 messages as the other tools.
    const pageCount = (await loadPdf(file)).getPageCount();
    if (pageCount > MAX_RENDERED_PAGES) {
      throw new BadRequestException(
        `PDF to image supports up to ${MAX_RENDERED_PAGES} pages; this file has ${pageCount}`,
      );
    }

    const entries: Record<string, Uint8Array> = {};
    // shortcut: renders on the main thread, blocking other requests while it runs;
    // move to a worker thread (piscina) when concurrent conversions become common.
    await renderPages(file, (canvas, pageNumber) => {
      entries[`page-${pageNumber}.${format === ImageFormat.Png ? 'png' : 'jpg'}`] =
        format === ImageFormat.Png
          ? canvas.toBuffer('image/png')
          : canvas.toBuffer('image/jpeg', JPEG_QUALITY);
    });

    // level 0: JPEG/PNG are already compressed.
    return zipSync(entries, { level: 0 });
  }

  private async embedImage(doc: PDFDocument, bytes: Buffer, position: number): Promise<PDFImage> {
    try {
      return isPng(bytes) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    } catch {
      throw new UnprocessableEntityException(`Image ${position} is not a valid JPEG or PNG`);
    }
  }
}
