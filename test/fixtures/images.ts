import { crc32, deflateSync } from 'node:zlib';

/** Smallest valid baseline JPEG: 1×1 pixel, no metadata. */
export const TINY_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64',
);

/** A black RGB PNG of the given size. */
export function png(width: number, height: number): Buffer {
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData));
    return Buffer.concat([length, typeAndData, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 2; // RGB
  const rows = Buffer.alloc((width * 3 + 1) * height); // filter byte 0 + black pixels per row

  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Inserts an EXIF (APP1) segment with the given orientation right after the JPEG's SOI marker. */
export function withExifOrientation(
  jpeg: Buffer,
  orientation: number,
  littleEndian = false,
): Buffer {
  const tiff = Buffer.alloc(26);
  const u16 = (value: number, at: number) =>
    littleEndian ? tiff.writeUInt16LE(value, at) : tiff.writeUInt16BE(value, at);
  const u32 = (value: number, at: number) =>
    littleEndian ? tiff.writeUInt32LE(value, at) : tiff.writeUInt32BE(value, at);
  tiff.write(littleEndian ? 'II' : 'MM', 0, 'latin1');
  u16(42, 2); // TIFF magic
  u32(8, 4); // offset of the first IFD
  u16(1, 8); // one entry
  u16(0x0112, 10); // Orientation tag
  u16(3, 12); // type SHORT
  u32(1, 14); // count
  u16(orientation, 18);
  u32(0, 22); // no next IFD

  const data = Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff]);
  const segment = Buffer.alloc(4);
  segment.writeUInt16BE(0xffe1, 0);
  segment.writeUInt16BE(data.length + 2, 2);
  return Buffer.concat([jpeg.subarray(0, 2), segment, data, jpeg.subarray(2)]);
}
