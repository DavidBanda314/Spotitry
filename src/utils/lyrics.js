// Lyrics fetching + parsing via LRCLIB (https://lrclib.net) — free, no API key.
// LRCLIB returns plain lyrics and, when available, synced (LRC) lyrics whose
// per-line timestamps we use to highlight the current line during playback.

const LRCLIB_BASE = 'https://lrclib.net/api'

// Parse a single LRC timestamp tag like [01:23.45] into milliseconds.
function parseLrcTime(min, sec, frac) {
  const m = parseInt(min, 10) || 0
  const s = parseInt(sec, 10) || 0
  // frac may be 2 or 3 digits (centiseconds or milliseconds)
  let ms = 0
  if (frac) {
    ms = frac.length === 3 ? parseInt(frac, 10) : parseInt(frac, 10) * 10
  }
  return (m * 60 + s) * 1000 + ms
}

// Convert raw LRC text into a sorted array of { timeMs, text } lines.
// A line may carry multiple timestamp tags; each produces a separate entry.
export function parseSyncedLyrics(lrc) {
  if (!lrc || typeof lrc !== 'string') return []
  const tagRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{2,3}))?\]/g
  const lines = []
  lrc.split(/\r?\n/).forEach((rawLine) => {
    const tags = []
    let match
    tagRegex.lastIndex = 0
    while ((match = tagRegex.exec(rawLine)) !== null) {
      tags.push(parseLrcTime(match[1], match[2], match[3]))
    }
    if (tags.length === 0) return
    const text = rawLine.replace(tagRegex, '').trim()
    tags.forEach((timeMs) => lines.push({ timeMs, text }))
  })
  lines.sort((a, b) => a.timeMs - b.timeMs)
  return lines
}

// Split plain (unsynced) lyrics into an array of trimmed lines.
export function parsePlainLyrics(plain) {
  if (!plain || typeof plain !== 'string') return []
  return plain.split(/\r?\n/).map((l) => l.trim())
}

function buildResult(data) {
  if (!data) return { found: false }
  if (data.instrumental) {
    return { found: true, instrumental: true, synced: false, lines: [], plain: [] }
  }
  const synced = parseSyncedLyrics(data.syncedLyrics)
  const plain = parsePlainLyrics(data.plainLyrics)
  if (synced.length === 0 && plain.length === 0) return { found: false }
  return {
    found: true,
    instrumental: false,
    synced: synced.length > 0,
    lines: synced,
    plain: plain,
    trackName: data.trackName,
    artistName: data.artistName,
  }
}

async function fetchJson(url, signal) {
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal,
  })
  if (!res.ok) return null
  return res.json()
}

// Fetch lyrics for a track. Tries the exact /get endpoint first (which can
// return synced lyrics), then falls back to /search. Returns a normalized
// shape: { found, instrumental, synced, lines: [{timeMs,text}], plain: [] }.
export async function getLyrics({ artist, track, album, durationMs } = {}, signal) {
  if (!artist || !track) return { found: false }

  const params = new URLSearchParams({ artist_name: artist, track_name: track })
  if (album) params.set('album_name', album)
  if (durationMs) params.set('duration', String(Math.round(durationMs / 1000)))

  try {
    const exact = await fetchJson(`${LRCLIB_BASE}/get?${params.toString()}`, signal)
    if (exact) {
      const result = buildResult(exact)
      if (result.found) return result
    }
  } catch (err) {
    if (err && err.name === 'AbortError') throw err
    // fall through to search
  }

  try {
    const searchParams = new URLSearchParams({ track_name: track, artist_name: artist })
    const results = await fetchJson(`${LRCLIB_BASE}/search?${searchParams.toString()}`, signal)
    if (Array.isArray(results) && results.length > 0) {
      // Prefer a result that has synced lyrics, otherwise the first hit.
      const withSynced = results.find((r) => r.syncedLyrics)
      return buildResult(withSynced || results[0])
    }
  } catch (err) {
    if (err && err.name === 'AbortError') throw err
  }

  return { found: false }
}

// Given synced lines and the current playback position, return the index of
// the line that should be highlighted (the last line whose time <= positionMs).
export function getActiveLineIndex(lines, positionMs) {
  if (!Array.isArray(lines) || lines.length === 0) return -1
  let lo = 0
  let hi = lines.length - 1
  let idx = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (lines[mid].timeMs <= positionMs) {
      idx = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return idx
}
