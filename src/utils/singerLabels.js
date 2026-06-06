// Programmatic per-line singer labeling for song lyrics.
//
// True "who is singing this line" from AUDIO is not feasible here (it requires
// speaker diarization over the full master recording, while Spotify only
// exposes ~30s previews). The approach that DOES work for collaborations is
// parsing Genius-style section headers that are embedded in the lyrics text,
// e.g.:
//   [Verse 1: Drake]
//   [Chorus: Rihanna]
//   [Bridge: Drake & Rihanna]
//   [Verse 2: Both]
//
// This module is source-agnostic: it operates on raw lyrics TEXT (plain or
// LRC-synced) and never depends on where the lyrics came from.

// Label used for lines that cannot be attributed to a named singer (lines
// before the first header, or lyrics that contain no headers at all).
export const UNKNOWN_SINGER = 'unknown'

// Matches a leading LRC timestamp tag such as [01:23.45] or [01:23] so synced
// lyrics can be normalized before header detection. Multiple tags may lead a
// single LRC line.
const LRC_TAG = /^\s*(?:\[\d{1,2}:\d{2}(?:[.:]\d{2,3})?\]\s*)+/

// A bracketed value that is purely an LRC timestamp (used to avoid mistaking a
// timestamp for a section header).
const TIMESTAMP_ONLY = /^\d{1,2}:\d{2}(?:[.:]\d{2,3})?$/

// Strip any leading LRC timestamp tag(s) from a raw line.
function stripLrcTags(line) {
  return line.replace(LRC_TAG, '')
}

// True if a (timestamp-stripped) line is a Genius-style section header like
// "[Verse 1: Drake]" or "[Chorus]". Requires the bracket content to contain at
// least one letter so bare timestamps are not treated as headers.
export function isSectionHeader(line) {
  if (!line || typeof line !== 'string') return false
  const stripped = stripLrcTags(line).trim()
  const match = stripped.match(/^\[(.+)\]$/)
  if (!match) return false
  const inner = match[1].trim()
  if (TIMESTAMP_ONLY.test(inner)) return false
  return /[a-z]/i.test(inner)
}

// Split a singer string into individual names, handling the common separators
// ",", "&", "/", "+", and the words "and"/"x" used between collaborators.
// Keywords such as "Both" and "All" are preserved verbatim (they reference the
// full set of credited artists, which this text-only parser cannot expand).
export function splitSingerNames(raw) {
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(/\s*(?:,|&|\/|\+|\sand\s|\sx\s|\s×\s)\s*/i)
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
}

// Parse a section header line into { section, singers }.
// "[Verse 1: Drake & Rihanna]" -> { section: 'Verse 1', singers: ['Drake', 'Rihanna'] }
// "[Chorus]"                   -> { section: 'Chorus', singers: [] }
export function parseSectionHeader(line) {
  const stripped = stripLrcTags(line).trim()
  const match = stripped.match(/^\[(.+)\]$/)
  if (!match) return null
  const inner = match[1].trim()
  const colon = inner.indexOf(':')
  if (colon === -1) {
    return { section: inner, singers: [] }
  }
  const section = inner.slice(0, colon).trim()
  const singers = splitSingerNames(inner.slice(colon + 1))
  return { section, singers }
}

// Attribute every lyric line to the singer(s) performing it, by parsing the
// section headers embedded in the lyrics. Returns an array of
//   { text, section, singers: string[] }
// for each non-empty, non-header lyric line. Header lines themselves are
// metadata and are not emitted. Lines before the first header (or in lyrics
// without any headers) are attributed to [UNKNOWN_SINGER].
export function labelLinesBySinger(lyricsText) {
  if (!lyricsText || typeof lyricsText !== 'string') return []

  let currentSection = null
  let currentSingers = [UNKNOWN_SINGER]
  const labeled = []

  lyricsText.split(/\r?\n/).forEach((rawLine) => {
    if (isSectionHeader(rawLine)) {
      const parsed = parseSectionHeader(rawLine)
      currentSection = parsed.section
      currentSingers =
        parsed.singers.length > 0 ? parsed.singers : [UNKNOWN_SINGER]
      return
    }

    const text = stripLrcTags(rawLine).trim()
    if (text.length === 0) return

    labeled.push({
      text,
      section: currentSection,
      singers: currentSingers.slice(),
    })
  })

  return labeled
}

// Whether a lyrics text contains at least one parseable section header that
// names a singer. Useful for deciding when programmatic labeling is viable.
export function hasParseableSingerHeaders(lyricsText) {
  if (!lyricsText || typeof lyricsText !== 'string') return false
  return lyricsText.split(/\r?\n/).some((line) => {
    if (!isSectionHeader(line)) return false
    const parsed = parseSectionHeader(line)
    return parsed.singers.length > 0
  })
}
