import React, { useEffect, useState, useRef } from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = Math.floor((millis % 60000) / 1000);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

const Share = (props) => {
    const { token, setSelectedSong: selectSong, playSong } = props
    const [trackData, setTrackData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
    const audioRef = useRef(null)

    const params = new URLSearchParams(window.location.search)
    const trackUri = params.get('track') || ''
    const positionMs = parseInt(params.get('t') || '0', 10)
    const note = params.get('note') || ''
    const trackId = trackUri.replace('spotify:track:', '')

    // Rich params embedded by the share handler (may not exist for old links)
    const paramName = params.get('s') || ''
    const paramArtist = params.get('a') || ''
    const paramAlbum = params.get('al') || ''
    const paramImg = params.get('img') || ''
    const paramPreview = params.get('p') || ''
    const paramDuration = parseInt(params.get('d') || '0', 10)

    useEffect(() => {
        if (!trackId) {
            setError('No track specified')
            setLoading(false)
            return
        }

        // If rich params are embedded, use those directly (no API call needed)
        if (paramName) {
            setTrackData({
                name: paramName,
                artists: paramArtist ? [{ name: paramArtist }] : [],
                album: { name: paramAlbum, images: paramImg ? [{ url: paramImg }] : [] },
                preview_url: paramPreview || null,
                duration_ms: paramDuration || 0,
                uri: trackUri,
                external_urls: { spotify: `https://open.spotify.com/track/${trackId}` },
            })
            setLoading(false)
            return
        }

        // Fallback: logged-in → Spotify API; logged-out → oEmbed
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
                setError('Could not load track')
                setLoading(false)
            })
        } else {
            fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setTrackData({
                        name: data.title,
                        artists: [],
                        album: { name: '', images: data.thumbnail_url ? [{ url: data.thumbnail_url }] : [] },
                        preview_url: null,
                        duration_ms: 0,
                        uri: trackUri,
                        external_urls: { spotify: `https://open.spotify.com/track/${trackId}` },
                    })
                }
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
        }
    }, [trackId, token, paramName, paramArtist, paramAlbum, paramImg, paramPreview, paramDuration, trackUri])

    const handlePlayInSpotitry = () => {
        if (trackData && token) {
            selectSong(0, trackData.uri, trackData)
            playSong(token, positionMs, trackData.uri, trackData)
        }
    }

    const togglePreview = () => {
        if (!audioRef.current) return
        if (isPreviewPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPreviewPlaying(!isPreviewPlaying)
    }

    const albumCover = trackData?.album?.images?.[0]?.url
    const trackName = trackData?.name
    const artistName = trackData?.artists?.map(a => a.name).filter(Boolean).join(', ')
    const albumName = trackData?.album?.name
    const previewUrl = trackData?.preview_url
    const spotifyUrl = trackData?.external_urls?.spotify || `https://open.spotify.com/track/${trackId}`
    const durationMs = trackData?.duration_ms

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
                        <span className={styles.timeText}>
                            {millisToMinutesAndSeconds(positionMs)}
                            {durationMs ? ` / ${millisToMinutesAndSeconds(durationMs)}` : ''}
                        </span>
                    </div>
                    {note && (
                        <div className={styles.noteBox}>
                            <span className={styles.noteLabel}>Note:</span>
                            <span className={styles.noteText}>"{note}"</span>
                        </div>
                    )}
                </div>

                {/* Hidden audio element for 30s preview */}
                {previewUrl && (
                    <audio
                        ref={audioRef}
                        src={previewUrl}
                        onEnded={() => setIsPreviewPlaying(false)}
                    />
                )}

                <div className={styles.actions}>
                    {previewUrl && (
                        <button className={styles.previewBtn} onClick={togglePreview}>
                            {isPreviewPlaying ? '❚❚ Pause Preview' : '▶ Play 30s Preview'}
                        </button>
                    )}
                    {token && trackData && (
                        <button className={styles.playBtn} onClick={handlePlayInSpotitry}>
                            ▶ Play in Spotitry from {millisToMinutesAndSeconds(positionMs)}
                        </button>
                    )}
                    {trackId && (
                        <a
                            className={styles.spotifyLink}
                            href={spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open on Spotify
                        </a>
                    )}
                    {!token && (
                        <a className={styles.loginLink} href="/">
                            Log in to Spotitry to play from {millisToMinutesAndSeconds(positionMs)}
                        </a>
                    )}
                </div>
                <div className={styles.footer}>
                    <a className={styles.footerLink} href="/">Made with Spotitry</a>
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
