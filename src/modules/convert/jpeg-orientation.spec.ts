import { TINY_JPEG, withExifOrientation } from '../../../test/fixtures/images';
import { readJpegOrientation } from './jpeg-orientation';

describe('readJpegOrientation', () => {
  it('returns 1 for a JPEG without EXIF', () => {
    expect(readJpegOrientation(TINY_JPEG)).toBe(1);
  });

  it('reads big-endian ("MM") EXIF', () => {
    expect(readJpegOrientation(withExifOrientation(TINY_JPEG, 6))).toBe(6);
  });

  it('reads little-endian ("II") EXIF', () => {
    expect(readJpegOrientation(withExifOrientation(TINY_JPEG, 8, true))).toBe(8);
  });

  it('returns 1 for invalid or truncated data', () => {
    expect(readJpegOrientation(Buffer.from('not a jpeg'))).toBe(1);
    expect(readJpegOrientation(withExifOrientation(TINY_JPEG, 6).subarray(0, 24))).toBe(1);
  });
});
