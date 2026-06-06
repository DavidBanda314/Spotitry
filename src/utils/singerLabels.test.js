import {
  labelLinesBySinger,
  parseSectionHeader,
  splitSingerNames,
  isSectionHeader,
  hasParseableSingerHeaders,
  UNKNOWN_SINGER,
} from './singerLabels'

describe('isSectionHeader', () => {
  it('detects Genius-style headers', () => {
    expect(isSectionHeader('[Verse 1: Drake]')).toBe(true)
    expect(isSectionHeader('[Chorus]')).toBe(true)
  })

  it('ignores plain lyric lines and bare LRC timestamps', () => {
    expect(isSectionHeader('I got a feeling')).toBe(false)
    expect(isSectionHeader('[00:12.34]')).toBe(false)
  })

  it('detects a header even with a leading LRC timestamp', () => {
    expect(isSectionHeader('[00:12.34] [Verse 1: Drake]')).toBe(true)
  })
})

describe('splitSingerNames', () => {
  it('splits on & , and / + x', () => {
    expect(splitSingerNames('Drake & Rihanna')).toEqual(['Drake', 'Rihanna'])
    expect(splitSingerNames('Drake, Rihanna')).toEqual(['Drake', 'Rihanna'])
    expect(splitSingerNames('Drake and Rihanna')).toEqual(['Drake', 'Rihanna'])
    expect(splitSingerNames('Drake, Rihanna & Future')).toEqual([
      'Drake',
      'Rihanna',
      'Future',
    ])
  })

  it('preserves Both/All keywords', () => {
    expect(splitSingerNames('Both')).toEqual(['Both'])
    expect(splitSingerNames('All')).toEqual(['All'])
  })
})

describe('parseSectionHeader', () => {
  it('parses single-artist header', () => {
    expect(parseSectionHeader('[Verse 1: Drake]')).toEqual({
      section: 'Verse 1',
      singers: ['Drake'],
    })
  })

  it('parses multi-artist header', () => {
    expect(parseSectionHeader('[Bridge: Drake & Rihanna]')).toEqual({
      section: 'Bridge',
      singers: ['Drake', 'Rihanna'],
    })
  })

  it('parses header with no singer', () => {
    expect(parseSectionHeader('[Chorus]')).toEqual({
      section: 'Chorus',
      singers: [],
    })
  })
})

describe('labelLinesBySinger', () => {
  it('attributes lines under a single-artist header', () => {
    const lyrics = ['[Verse 1: Drake]', 'Line one', 'Line two'].join('\n')
    expect(labelLinesBySinger(lyrics)).toEqual([
      { text: 'Line one', section: 'Verse 1', singers: ['Drake'] },
      { text: 'Line two', section: 'Verse 1', singers: ['Drake'] },
    ])
  })

  it('attributes lines to multiple artists (& , and)', () => {
    const lyrics = [
      '[Verse 1: Drake & Rihanna]',
      'A',
      '[Chorus: Drake, Rihanna and Future]',
      'B',
    ].join('\n')
    expect(labelLinesBySinger(lyrics)).toEqual([
      { text: 'A', section: 'Verse 1', singers: ['Drake', 'Rihanna'] },
      {
        text: 'B',
        section: 'Chorus',
        singers: ['Drake', 'Rihanna', 'Future'],
      },
    ])
  })

  it('handles Both/All keywords', () => {
    const lyrics = [
      '[Verse 2: Both]',
      'Together now',
      '[Outro: All]',
      'Everyone sings',
    ].join('\n')
    expect(labelLinesBySinger(lyrics)).toEqual([
      { text: 'Together now', section: 'Verse 2', singers: ['Both'] },
      { text: 'Everyone sings', section: 'Outro', singers: ['All'] },
    ])
  })

  it('labels lines before the first header as unknown', () => {
    const lyrics = ['Intro mumble', '[Verse 1: Drake]', 'Real line'].join('\n')
    expect(labelLinesBySinger(lyrics)).toEqual([
      { text: 'Intro mumble', section: null, singers: [UNKNOWN_SINGER] },
      { text: 'Real line', section: 'Verse 1', singers: ['Drake'] },
    ])
  })

  it('labels everything unknown when there are no headers', () => {
    const lyrics = ['Just a line', '', 'Another line'].join('\n')
    expect(labelLinesBySinger(lyrics)).toEqual([
      { text: 'Just a line', section: null, singers: [UNKNOWN_SINGER] },
      { text: 'Another line', section: null, singers: [UNKNOWN_SINGER] },
    ])
  })

  it('treats a header with no singer as a section change with unknown singer', () => {
    const lyrics = ['[Chorus]', 'La la la'].join('\n')
    expect(labelLinesBySinger(lyrics)).toEqual([
      { text: 'La la la', section: 'Chorus', singers: [UNKNOWN_SINGER] },
    ])
  })

  it('works on LRC-synced lyrics with timestamp tags', () => {
    const lyrics = [
      '[00:01.00] [Verse 1: Drake]',
      '[00:02.50] First line',
      '[00:05.00] Second line',
    ].join('\n')
    expect(labelLinesBySinger(lyrics)).toEqual([
      { text: 'First line', section: 'Verse 1', singers: ['Drake'] },
      { text: 'Second line', section: 'Verse 1', singers: ['Drake'] },
    ])
  })

  it('returns [] for empty or non-string input', () => {
    expect(labelLinesBySinger('')).toEqual([])
    expect(labelLinesBySinger(null)).toEqual([])
    expect(labelLinesBySinger(undefined)).toEqual([])
  })
})

describe('hasParseableSingerHeaders', () => {
  it('is true only when a header names a singer', () => {
    expect(hasParseableSingerHeaders('[Verse 1: Drake]\nhi')).toBe(true)
    expect(hasParseableSingerHeaders('[Chorus]\nhi')).toBe(false)
    expect(hasParseableSingerHeaders('no headers here')).toBe(false)
  })
})
