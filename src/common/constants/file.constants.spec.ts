import { PAGE_ORDER_PATTERN, PAGE_RANGES_PATTERN } from './file.constants';

describe('file constants', () => {
  it.each(['1', '1-3', '1-3,5,8-10'])('PAGE_RANGES_PATTERN accepts "%s"', (value) => {
    expect(PAGE_RANGES_PATTERN.test(value)).toBe(true);
  });

  it.each(['', '1-', '-3', '1,,2', '1 - 3', 'a'])('PAGE_RANGES_PATTERN rejects "%s"', (value) => {
    expect(PAGE_RANGES_PATTERN.test(value)).toBe(false);
  });

  it.each(['3', '3,1,2'])('PAGE_ORDER_PATTERN accepts "%s"', (value) => {
    expect(PAGE_ORDER_PATTERN.test(value)).toBe(true);
  });

  it.each(['', '1-3', '3,', ',3'])('PAGE_ORDER_PATTERN rejects "%s"', (value) => {
    expect(PAGE_ORDER_PATTERN.test(value)).toBe(false);
  });
});
