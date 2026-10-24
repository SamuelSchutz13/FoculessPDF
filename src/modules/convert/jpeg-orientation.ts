const EXIF_HEADER = 'Exif\0\0';
const ORIENTATION_TAG = 0x0112;

/**
 * Reads the EXIF orientation (1–8) of a JPEG; 1 (upright) when absent or unreadable.
 * Phone cameras store photos sideways and rely on this flag, which pdf-lib ignores.
 */
export function readJpegOrientation(bytes: Uint8Array): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  try {
    if (view.getUint16(0) !== 0xffd8) return 1;

    // Walk the marker segments until the APP1 (EXIF) one or the start of image data.
    let offset = 2;
    while (offset + 4 <= view.byteLength) {
      const marker = view.getUint16(offset);
      const length = view.getUint16(offset + 2);
      if (marker === 0xffda) return 1;
      if (marker === 0xffe1 && readAscii(bytes, offset + 4, 6) === EXIF_HEADER) {
        return readTiffOrientation(view, offset + 10);
      }
      offset += 2 + length;
    }
  } catch {
    // Truncated or malformed metadata: treat the image as upright.
  }
  return 1;
}

function readTiffOrientation(view: DataView, tiffStart: number): number {
  const littleEndian = view.getUint16(tiffStart) === 0x4949; // "II" (Intel) vs "MM" (Motorola)
  const ifd = tiffStart + view.getUint32(tiffStart + 4, littleEndian);
  const entries = view.getUint16(ifd, littleEndian);

  for (let i = 0; i < entries; i++) {
    const entry = ifd + 2 + i * 12;
    if (view.getUint16(entry, littleEndian) === ORIENTATION_TAG) {
      const value = view.getUint16(entry + 8, littleEndian);
      return value >= 1 && value <= 8 ? value : 1;
    }
  }
  return 1;
}

function readAscii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}
