import React, { useEffect, useState } from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

const Share = (props) => {
    const { token, setSelectedSong: selectSong, playSong } = props
    const [trackData, setTrackData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const params = new URLSearchParams(window.location.search)
    const trackUri = params.get('track') || ''
    const positionMs = parseInt(params.get('t') || '0', 10)
    const note = params.get('note') || ''
    const trackId = trackUri.replace('spotify:track:', '')

    useEffect(() => {
        if (!trackId) {
            setError('No track specified')
            setLoading(false)
            return
        }
        if (token) {
            fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(res => {
                if (!res.ok) throw new Error('Could not load track')
                return res.json()
            })
            .then(data => {
                setTrackData(data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }, [trackId, token])

    const handlePlayInSpotitry = () => {
        if (trackData && token) {
            selectSong(0, trackData.uri, trackData)
            playSong(token, positionMs, trackData.uri, trackData)
        }
    }

    const albumCover = trackData?.album?.images?.[0]?.url
    const trackName = trackData?.name
    const artistName = trackData?.artists?.[0]?.name
    const albumName = trackData?.album?.name

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading shared timestamp...</div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.badge}>Shared Timestamp</div>
                {albumCover && (
                    <img className={styles.albumArt} src={albumCover} alt={trackName || 'Album'} />
                )}
                <div className={styles.info}>
                    <h2 className={styles.trackName}>{trackName || 'Unknown Track'}</h2>
                    {artistName && <p className={styles.artist}>{artistName}</p>}
                    {albumName && <p className={styles.album}>{albumName}</p>}
                    <div className={styles.timestamp}>
                        <span className={styles.timeIcon}>⏱</span>
                        <span className={styles.timeText}>{millisToMinutesAndSeconds(positionMs)}</span>
                    </div>
                    {note && (
                        <div className={styles.noteBox}>
                            <span className={styles.noteLabel}>Note:</span>
                            <span className={styles.noteText}>"{note}"</span>
                        </div>
                    )}
                </div>
                <div className={styles.actions}>
                    {token && trackData && (
                        <button className={styles.playBtn} onClick={handlePlayInSpotitry}>
                            ▶ Play in Spotitry
                        </button>
                    )}
                    {trackId && (
                        <a
                            className={styles.spotifyLink}
                            href={`https://open.spotify.com/track/${trackId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open on Spotify
                        </a>
                    )}
                </div>
            </div>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        playSong: (token, position_ms, songURI, song) => dispatch(playSongRequested(token, position_ms, songURI, song)),
        setSelectedSong: (position_ms, songURI, song) => dispatch(setSelectedSong(position_ms, songURI, song))
    }
}
const mapStateToProps = (state) => {
    return {
        token: state.User.token,
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Share)
