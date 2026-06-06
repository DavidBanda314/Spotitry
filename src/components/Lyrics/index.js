import React, { useEffect, useRef, useState } from 'react'
import styles from './index.module.css'
import { getLyrics, getActiveLineIndex } from '../../utils/lyrics'

// Displays lyrics for the given track. When synced (timestamped) lyrics are
// available, the current line is highlighted and auto-scrolled based on the
// player's `progressMs`. Otherwise plain lyrics are shown as static text.
const Lyrics = (props) => {
  const { song, progressMs } = props
  const [state, setState] = useState({ status: 'idle', data: null })

  const artist = (song?.artists || []).map((a) => a.name).filter(Boolean)[0]
  const track = song?.name
  const album = song?.album?.name
  const durationMs = song?.duration_ms

  useEffect(() => {
    if (!artist || !track) {
      setState({ status: 'empty', data: null })
      return
    }
    const controller = new AbortController()
    setState({ status: 'loading', data: null })
    getLyrics({ artist, track, album, durationMs }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        if (!result.found) {
          setState({ status: 'empty', data: null })
        } else if (result.instrumental) {
          setState({ status: 'instrumental', data: null })
        } else {
          setState({ status: 'ready', data: result })
        }
      })
      .catch((err) => {
        if (err && err.name === 'AbortError') return
        setState({ status: 'error', data: null })
      })
    return () => controller.abort()
  }, [artist, track, album, durationMs])

  const data = state.data
  const synced = data?.synced
  const activeIndex = synced ? getActiveLineIndex(data.lines, progressMs || 0) : -1

  const activeRef = useRef(null)
  useEffect(() => {
    if (activeRef.current && activeRef.current.scrollIntoView) {
      activeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [activeIndex])

  if (state.status === 'loading' || state.status === 'idle') {
    return <div className={styles.message}>Loading lyrics…</div>
  }
  if (state.status === 'instrumental') {
    return <div className={styles.message}>This track is instrumental 🎵</div>
  }
  if (state.status === 'error') {
    return <div className={styles.message}>Couldn’t load lyrics right now.</div>
  }
  if (state.status === 'empty' || !data) {
    return <div className={styles.message}>No lyrics found for this track.</div>
  }

  if (synced) {
    return (
      <div className={styles.container}>
        {data.lines.map((line, i) => (
          <p
            key={i}
            ref={i === activeIndex ? activeRef : null}
            className={`${styles.line} ${i === activeIndex ? styles.active : ''} ${i < activeIndex ? styles.past : ''}`}
          >
            {line.text || '♪'}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {data.plain.map((line, i) => (
        <p key={i} className={styles.plainLine}>{line || '\u00A0'}</p>
      ))}
    </div>
  )
}

export default Lyrics
