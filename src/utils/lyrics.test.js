import { parseSyncedLyrics, parsePlainLyrics, getActiveLineIndex } from './lyrics';

describe('parseSyncedLyrics', () => {
  test('parses LRC timestamps into sorted ms entries', () => {
    const lrc = '[00:13.42] Yeah\n[00:29.83] I have been on my own\n[00:14.81]';
    const lines = parseSyncedLyrics(lrc);
    expect(lines).toEqual([
      { timeMs: 13420, text: 'Yeah' },
      { timeMs: 14810, text: '' },
      { timeMs: 29830, text: 'I have been on my own' },
    ]);
  });

  test('supports millisecond (3-digit) fractions', () => {
    expect(parseSyncedLyrics('[01:02.500] hi')).toEqual([
      { timeMs: 62500, text: 'hi' },
    ]);
  });

  test('expands multiple timestamps on one line into separate entries', () => {
    const lines = parseSyncedLyrics('[00:01.00][00:05.00] repeat');
    expect(lines).toEqual([
      { timeMs: 1000, text: 'repeat' },
      { timeMs: 5000, text: 'repeat' },
    ]);
  });

  test('returns empty array for missing input', () => {
    expect(parseSyncedLyrics('')).toEqual([]);
    expect(parseSyncedLyrics(null)).toEqual([]);
  });
});

describe('parsePlainLyrics', () => {
  test('splits and trims lines', () => {
    expect(parsePlainLyrics('  one \r\n two\n')).toEqual(['one', 'two', '']);
  });
});

describe('getActiveLineIndex', () => {
  const lines = [
    { timeMs: 0, text: 'a' },
    { timeMs: 1000, text: 'b' },
    { timeMs: 2000, text: 'c' },
  ];

  test('returns the last line at or before the position', () => {
    expect(getActiveLineIndex(lines, 0)).toBe(0);
    expect(getActiveLineIndex(lines, 1500)).toBe(1);
    expect(getActiveLineIndex(lines, 9000)).toBe(2);
  });

  test('returns -1 before the first line or for empty input', () => {
    expect(getActiveLineIndex(lines, -1)).toBe(-1);
    expect(getActiveLineIndex([], 100)).toBe(-1);
  });
});
