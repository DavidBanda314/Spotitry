import { parseSpecialCharacters } from './utils/constants';

// parseSpecialCharacters derives a Firebase-safe key from a Spotify user id by
// stripping every non-alphanumeric character.
describe('parseSpecialCharacters', () => {
  test('removes spaces and punctuation', () => {
    expect(parseSpecialCharacters('a.b c-d!')).toBe('abcd');
  });

  test('keeps letters and digits', () => {
    expect(parseSpecialCharacters('User_123')).toBe('User123');
  });

  test('returns an empty string when there is nothing alphanumeric', () => {
    expect(parseSpecialCharacters('!@#$%^&*()')).toBe('');
  });

  test('leaves an already-clean string unchanged', () => {
    expect(parseSpecialCharacters('spotitry')).toBe('spotitry');
  });
});
