import { degrees, PDFDocument, type PDFImage } from '@cantoo/pdf-lib';
import { Injectable, NotImplementedException, UnprocessableEntityException } from '@nestjs/common';
import type { ImageFormat } from './dto/pdf-to-image.dto';
import { readJpegOrientation } from './jpeg-orientation';

/** A4 portrait, in points. Landscape images get the page turned sideways. */
const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 20;

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

  /** Returns a ZIP with one image per page. */
  async pdfToImage(_file: Buffer, _format: ImageFormat): Promise<Uint8Array> {
    throw new NotImplementedException('PDF to image is not implemented yet');
  }

  private async embedImage(doc: PDFDocument, bytes: Buffer, position: number): Promise<PDFImage> {
    try {
      return isPng(bytes) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    } catch {
      throw new UnprocessableEntityException(`Image ${position} is not a valid JPEG or PNG`);
    }
  }
}
