import { BadRequestException } from '@nestjs/common';

/** 1-based, inclusive page range. */
export interface PageRange {
  start: number;
  end: number;
}

/**
 * Parses "1-3,5" into ranges and checks them against the document.
 * The format itself is already validated by PAGE_RANGES_PATTERN in the DTO.
 */
export function parsePageRanges(ranges: string, pageCount: number): PageRange[] {
  return ranges.split(',').map((part) => {
    const [start, end = start] = part.split('-').map(Number);
    if (start < 1 || start > end || end > pageCount) {
      throw new BadRequestException(
        `Invalid page range "${part}": the document has ${pageCount} page(s)`,
      );
    }
    return { start, end };
  });
}

/** Converts a range to the 0-based page indices used by pdf-lib. */
export function toPageIndices({ start, end }: PageRange): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
}
