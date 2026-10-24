import {
  PDFArray,
  PDFDict,
  type PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
} from '@cantoo/pdf-lib';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { Injectable } from '@nestjs/common';
import { loadPdf } from '../../common/pdf/load-pdf';
import { CompressionLevel } from './dto/compress.dto';

/** JPEG quality and longest image side (px) per level. */
const SETTINGS: Record<CompressionLevel, { quality: number; maxSide: number }> = {
  [CompressionLevel.Low]: { quality: 85, maxSide: 2500 },
  [CompressionLevel.Recommended]: { quality: 70, maxSide: 1800 },
  [CompressionLevel.Extreme]: { quality: 50, maxSide: 1200 },
};

const name = (value: string) => PDFName.of(value);

@Injectable()
export class CompressService {
  /**
   * Re-encodes the JPEG photos inside the PDF (smaller size, lower quality) and saves the
   * document with compressed object streams. Returns the original if nothing got smaller.
   */
  async compress(file: Buffer, level: CompressionLevel): Promise<Uint8Array> {
    const doc = await loadPdf(file);
    const { quality, maxSide } = SETTINGS[level];

    // Each image is stored once even when shown on several pages, so it's handled once.
    for (const [, object] of doc.context.enumerateIndirectObjects()) {
      if (object instanceof PDFRawStream && isRecompressibleJpeg(doc, object.dict)) {
        await recompressJpeg(object, quality, maxSide);
      }
    }

    const compressed = await doc.save({ useObjectStreams: true });
    return compressed.length < file.length ? compressed : file;
  }
}

/**
 * Only plain RGB/gray JPEGs are touched: re-encoding CMYK, masks or images with custom
 * decode arrays through a canvas would change their colors.
 */
// shortcut: Flate-compressed (PNG-like) images are left as they are; converting them needs
// decoding PDF predictors. Add it when users report PDFs that don't shrink.
function isRecompressibleJpeg(doc: PDFDocument, dict: PDFDict): boolean {
  if (dict.get(name('Subtype')) !== name('Image')) return false;
  if (dict.has(name('Decode')) || dict.has(name('ImageMask'))) return false;

  const filter = dict.lookup(name('Filter'));
  const filters = filter instanceof PDFArray ? filter.asArray() : [filter];
  if (filters.length !== 1 || filters[0] !== name('DCTDecode')) return false;

  const colorSpace = dict.lookup(name('ColorSpace'));
  if (colorSpace === name('DeviceRGB') || colorSpace === name('DeviceGray')) return true;
  // ICC-based spaces are fine when they are RGB (N 3) or gray (N 1).
  if (colorSpace instanceof PDFArray && colorSpace.lookup(0) === name('ICCBased')) {
    const profile = doc.context.lookup(colorSpace.get(1));
    const components = profile instanceof PDFRawStream ? profile.dict.lookup(name('N')) : undefined;
    return components instanceof PDFNumber && [1, 3].includes(components.asNumber());
  }
  return false;
}

async function recompressJpeg(stream: PDFRawStream, quality: number, maxSide: number) {
  const original = stream.getContents();
  let image: Awaited<ReturnType<typeof loadImage>>;
  try {
    image = await loadImage(Buffer.from(original));
  } catch {
    return; // undecodable image data: keep it untouched rather than fail the whole file
  }

  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  // White under transparent pixels, as JPEG has no alpha.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const recompressed = canvas.toBuffer('image/jpeg', quality);

  if (recompressed.length >= original.length) return;

  // Width/Height may shrink; the page still draws the image at the same size on paper.
  const { dict } = stream;
  dict.set(name('Width'), PDFNumber.of(width));
  dict.set(name('Height'), PDFNumber.of(height));
  dict.set(name('ColorSpace'), name('DeviceRGB'));
  dict.set(name('BitsPerComponent'), PDFNumber.of(8));
  dict.delete(name('DecodeParms'));
  stream.updateContents(recompressed);
}
