# Programmatic Per-Line Singer Labeling — Investigation & Prototype

**Scope:** Can we programmatically attribute each lyric line of a song to the
singer(s) performing it, for use in Spotitry? This report covers feasibility, a
working prototype, a real coverage measurement against LRCLIB, a comparison of
LRCLIB vs Genius as lyric sources, and a ship/no-ship recommendation.

**TL;DR:** Audio-based "who is singing" is out of scope. A text-based
**section-header parser** is the only programmatic approach that works, and it
only works when the lyrics text actually contains Genius-style headers like
`[Verse 1: Drake]`. **LRCLIB — the source already wired into the app — strips
these headers, so measured coverage there is 0%.** Genius retains them but is
not legally/technically accessible for automated lyric retrieval. Recommendation:
ship the parser as an opportunistic enhancement, default to `unknown`, and do
**not** build the feature around LRCLIB-sourced lyrics.

---

## (a) Feasibility summary

### Audio-based identification is out of scope
Determining who sings each line directly from audio requires **speaker/singer
diarization** over the full master recording (segmenting audio by voice and
clustering segments per speaker). That is infeasible here because:

- **No full audio.** The Spotify Web API exposes only ~30-second **previews**
  for most tracks, not the full master. You cannot diarize a song you cannot
  fully access.
- **Singing diarization is hard and heavy.** Even with full audio, music
  diarization (overlapping harmonies, backing vocals, ad-libs, effects) is a
  research-grade ML problem requiring large models and GPU inference — wildly
  out of proportion for a CRA front-end app, and impossible to run client-side
  in the browser.
- **No ground-truth mapping.** Diarization yields "voice A / voice B" clusters,
  not names. Mapping clusters → real artist names still needs external metadata.

### Text-based section-header parsing is feasible
Genius-style transcriptions embed structural headers that *name the performer*:

```
[Verse 1: Drake]
[Chorus: Rihanna]
[Bridge: Drake & Rihanna]
[Verse 2: Both]
```

These are deterministic to parse: detect header lines, extract the name(s) after
the colon (splitting on `,`, `&`, `and`, `/`, `+`, `x`), and attribute every
following lyric line to those singers until the next header. Lines before the
first header — and all lines in header-less lyrics — are labeled `unknown`.
This is exactly what the prototype does, and it is fully source-agnostic (works
on plain text or LRC-synced text). **The catch is entirely about whether the
chosen lyric source preserves the headers.**

---

## (b) Coverage measurement (real data)

I sampled **20 well-known multi-artist / collaboration songs** and fetched their
lyrics from **LRCLIB's public API** (`/api/search`, no key needed), then ran the
prototype's header detector (`isSectionHeader` / `hasParseableSingerHeaders`)
over the returned text. Script: `coverage_study.mjs` (uses the exact same
detection code as `src/utils/singerLabels.js`).

### Results

| Metric | Value |
| --- | --- |
| Songs queried | 20 |
| Lyrics found on LRCLIB | 19 / 20 |
| Returned as **synced** (LRC) lyrics | 19 / 19 |
| Songs with **any** section header (`[...]`) | **0 / 19** |
| Songs with **parseable singer headers** | **0 / 19** |
| **Coverage (of found songs)** | **0.0%** |

Sample of the 20 collabs queried (artist – track as matched by LRCLIB):

- Future ft Drake, Tems – WAIT FOR U
- The Kid LAROI. – STAY
- Lil Nas X – INDUSTRY BABY (ft. Jack Harlow)
- The Weeknd – Save Your Tears (Remix) (w/ Ariana Grande)
- Post Malone – Sunflower (w/ Swae Lee)
- Shawn Mendes – Señorita (w/ Camila Cabello)
- Travis Scott – FE!N (w/ Playboi Carti)
- DJ Khaled – Wild Thoughts (Rihanna, Bryson Tiller)
- Doja Cat & SZA – Kiss Me More
- Justin Bieber – Peaches (Daniel Caesar, Giveon)
- JAY-Z – Empire State Of Mind (w/ Alicia Keys)
- Lady Gaga – Telephone (w/ Beyoncé)
- Kendrick Lamar – Money Trees (w/ Jay Rock)
- …and 7 more (Maroon 5 – Beautiful Mistakes, Calvin Harris – One Kiss,
  Ed Sheeran – I Don't Care, DJ Khaled – No Brainer, etc.)

**Every single LRCLIB result was a clean, header-free transcription** — usually
LRC-synced, with zero `[Section: Artist]` markers. This is by design: LRCLIB's
synced-lyrics format is line/time pairs for karaoke-style highlighting, and the
contributor tooling normalizes out structural annotations.

> **Conclusion for (b): On LRCLIB, parseable-singer-header coverage is 0%.** The
> parser is correct, but the LRCLIB source provides nothing for it to parse.

(The prototype's own unit tests, `src/utils/singerLabels.test.js`, prove the
parser correctly extracts singers from Genius-style text when headers *are*
present — single-artist, multi-artist with `&`/`,`/`and`, `Both`/`All`, lines
before the first header, header-less lyrics, and LRC-synced input.)

---

## (c) LRCLIB vs Genius for header availability + legal/ToS

| | **LRCLIB** | **Genius** |
| --- | --- | --- |
| Section headers `[Verse: Artist]` | **Stripped** (measured 0/19) | **Preserved** — this is the origin of the convention |
| Synced (per-line timing) | Yes (most tracks) | No |
| Public API, no key | Yes (`/api/search`, `/api/get`) | No — official API requires OAuth `access_token` (measured: `401 This call requires an access_token`) |
| Lyrics body via official API | Yes | **No** — the official API returns metadata + a URL only; the lyric text is **not** in the API |
| Automated page fetch | Allowed (it's the product) | **Blocked** — `genius.com` returned **HTTP 403** to an automated request |
| Cost / licensing | Free, crowd-sourced, CC0-style | Commercial; lyrics are licensed content |

**Genius header availability:** Genius (and its community transcription format)
is *where* the `[Verse 1: Artist]` convention comes from, so collab songs on
Genius very frequently carry per-section singer attributions. Qualitatively this
is the only mainstream source with high header coverage for collaborations.

**But Genius is not programmatically usable for the lyric text:**

- **Official API** (`api.genius.com`): I confirmed it returns
  `401 — This call requires an access_token`. Even with a token, the API
  **does not return the lyrics body** (only song metadata + a `url`). Genius
  deliberately keeps the lyric text out of the API.
- **Scraping the web page**: I confirmed `genius.com` returns **HTTP 403** to a
  plain automated request. Genius actively blocks scrapers, and scraping the
  lyrics body **violates Genius's Terms of Service** and the underlying lyric
  licensing. Shipping a scraper would be both technically brittle and a legal
  liability.

**LRCLIB** is the opposite trade-off: open, free, no key, great for synced
karaoke highlighting (already used in `src/utils/lyrics.js`), but it gives the
parser nothing to work with for singer attribution.

---

## (d) Recommendation

**Ship the parser, but as an opportunistic enhancement — not a headline
feature, and not built on LRCLIB.**

1. **Ship `labelLinesBySinger`** (`src/utils/singerLabels.js`). It is pure,
   tested, source-agnostic, and zero-cost. When lyrics *do* contain headers it
   produces correct per-line attribution; when they don't, it degrades
   gracefully to `unknown`. There is no downside to having it.

2. **Do not rely on LRCLIB for this feature.** Measured coverage is **0%**, so
   wiring the UI to expect singer labels from LRCLIB-sourced lyrics would mislead
   users (everything would read `unknown`). Keep LRCLIB for what it's good at:
   synced line highlighting.

3. **Where it actually works:** any lyrics text that already carries
   Genius-style headers — e.g. user-pasted lyrics, an internal/curated lyrics
   store, or a future **licensed** Genius integration (with a token *and* a
   ToS-compliant agreement that grants the lyric body). For those inputs,
   collaboration coverage is high.

4. **Fallback behavior (the default path today):**
   - Show lyrics normally via LRCLIB (synced highlighting).
   - Run `labelLinesBySinger` over whatever text is available.
   - If `hasParseableSingerHeaders` is **false** (the common case with LRCLIB),
     render **no per-singer UI** and treat all lines as `unknown` — i.e. plain
     lyrics, no false attribution.
   - Only surface per-singer styling/badges when headers are present.

5. **Do NOT** attempt audio diarization or Genius scraping. The former is
   infeasible (previews only, research-grade ML); the latter is blocked (403)
   and against Genius ToS.

**Bottom line:** Programmatic per-line singer labeling is feasible *only* via
section-header parsing, and *only* for lyrics that already contain the headers.
The parser is ready and safe to ship as a graceful enhancement, but it cannot be
the product's backbone until a header-preserving, legally-licensed lyric source
is available — which LRCLIB is not, and which Genius is not without a paid,
ToS-compliant license.
