import { BadRequestException } from '@nestjs/common';
import { parsePageRanges, toPageIndices } from './page-ranges';

describe('parsePageRanges', () => {
  it('parses single pages and ranges in order', () => {
    expect(parsePageRanges('1-3,5,4-4', 5)).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 4, end: 4 },
    ]);
  });

  it.each(['0', '6', '2-6', '3-1'])('rejects "%s" for a 5-page document', (ranges) => {
    expect(() => parsePageRanges(ranges, 5)).toThrow(BadRequestException);
  });
});

describe('toPageIndices', () => {
  it('returns 0-based indices', () => {
    expect(toPageIndices({ start: 2, end: 4 })).toEqual([1, 2, 3]);
  });
});
