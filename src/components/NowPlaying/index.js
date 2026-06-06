import React, { useState } from 'react'
import styles from './index.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import Lyrics from '../Lyrics'

const NowPlaying = (props) => {
    const { song, onCollapse, onSave, saved, progressMs } = props
    const [showLyrics, setShowLyrics] = useState(false)

    const images = song?.album?.images || []
    const artUrl = images[0]?.url
    const artistNames = (song?.artists || []).map((a) => a.name).filter(Boolean).join(', ')

    return (
        <div className={styles.reel}>
            <button
                type="button"
                className={styles.collapse}
                onClick={onCollapse}
                aria-label="Collapse player"
                title="Collapse"
            >
                <FontAwesomeIcon icon={faChevronDown} />
            </button>

            <div className={styles.body}>
                {showLyrics ? (
                    <Lyrics song={song} progressMs={progressMs} />
                ) : (
                    <>
                        {artUrl ? (
                            <img src={artUrl} alt={song?.name || 'Album art'} className={styles.art} />
                        ) : (
                            <div className={`${styles.art} ${styles.artPlaceholder}`} />
                        )}
                        <div className={styles.meta}>
                            <span className={styles.title}>{song?.name}</span>
                            <span className={styles.artist}>{artistNames}</span>
                        </div>
                    </>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setShowLyrics((prev) => !prev)}
                        aria-pressed={showLyrics}
                    >
                        {showLyrics ? 'Cover' : 'Lyrics'}
                    </button>
                    <button
                        type="button"
                        className={styles.save}
                        onClick={onSave}
                        aria-label="Save timestamp"
                    >
                        {saved ? '✓ Saved' : '⏱ Save Timestamp'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NowPlaying;
