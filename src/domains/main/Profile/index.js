import React, { useEffect, useState } from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchPublicProfile } from '../../../firebase'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = Math.floor((millis % 60000) / 1000);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

const Profile = (props) => {
    const { token, setSelectedSong: selectSong, playSong } = props
    const { userId } = useParams()
    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isPrivate, setIsPrivate] = useState(false)

    useEffect(() => {
        if (userId) {
            fetchPublicProfile(userId).then((result) => {
                if (!result || !result.isPublic) {
                    setIsPrivate(true)
                } else {
                    setProfileData(result.publicProfile)
                }
                setLoading(false)
            })
        }
    }, [userId])

    const handlePlayTrack = (track) => {
        if (token && track.uri) {
            selectSong(0, track.uri, { name: track.name, uri: track.uri })
            playSong(token, 0, track.uri, { name: track.name, uri: track.uri })
        }
    }

    const handlePlayTimestamp = (ts) => {
        if (token && ts.uri) {
            selectSong(ts.position_ms, ts.uri, { name: ts.songName, uri: ts.uri })
            playSong(token, ts.position_ms, ts.uri, { name: ts.songName, uri: ts.uri })
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading profile...</div>
            </div>
        )
    }

    if (isPrivate || !profileData) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.privateMessage}>This profile is private</div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.profileHeader}>
                    {profileData.profileImage && (
                        <img
                            className={styles.profileImage}
                            src={profileData.profileImage}
                            alt={profileData.displayName}
                        />
                    )}
                    <h1 className={styles.displayName}>{profileData.displayName}</h1>
                </div>

                {profileData.topTracks && profileData.topTracks.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Top Tracks</h2>
                        <div className={styles.trackList}>
                            {profileData.topTracks.map((track, index) => (
                                <div key={index} className={styles.trackItem}>
                                    {track.albumArt && (
                                        <img className={styles.trackArt} src={track.albumArt} alt={track.name} />
                                    )}
                                    <div className={styles.trackInfo}>
                                        <div className={styles.trackName}>{track.name}</div>
                                        <div className={styles.trackArtist}>{track.artist}</div>
                                    </div>
                                    <div className={styles.trackActions}>
                                        {token && track.uri && (
                                            <button
                                                className={styles.playBtn}
                                                onClick={() => handlePlayTrack(track)}
                                                title="Play in Spotitry"
                                            >
                                                &#9654;
                                            </button>
                                        )}
                                        {track.externalUrl && (
                                            <a
                                                className={styles.spotifyLink}
                                                href={track.externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Open on Spotify"
                                            >
                                                &#8599;
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {profileData.topArtists && profileData.topArtists.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Top Artists</h2>
                        <div className={styles.artistList}>
                            {profileData.topArtists.map((artist, index) => (
                                <div key={index} className={styles.artistItem}>
                                    {artist.image && (
                                        <img className={styles.artistImage} src={artist.image} alt={artist.name} />
                                    )}
                                    <div className={styles.artistName}>{artist.name}</div>
                                    {artist.externalUrl && (
                                        <a
                                            className={styles.spotifyLink}
                                            href={artist.externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Open on Spotify"
                                        >
                                            &#8599;
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {profileData.sharedTimestamps && profileData.sharedTimestamps.length > 0 && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Shared Timestamps</h2>
                        <div className={styles.timestampList}>
                            {profileData.sharedTimestamps.map((ts, index) => (
                                <div key={index} className={styles.timestampItem}>
                                    <div className={styles.timestampInfo}>
                                        <div className={styles.timestampSong}>{ts.songName}</div>
                                        <div className={styles.timestampArtist}>{ts.artist}</div>
                                        <div className={styles.timestampPosition}>
                                            {millisToMinutesAndSeconds(ts.position_ms)}
                                        </div>
                                        {ts.note && (
                                            <div className={styles.timestampNote}>"{ts.note}"</div>
                                        )}
                                    </div>
                                    <div className={styles.trackActions}>
                                        {token && ts.uri && (
                                            <button
                                                className={styles.playBtn}
                                                onClick={() => handlePlayTimestamp(ts)}
                                                title="Play in Spotitry"
                                            >
                                                &#9654;
                                            </button>
                                        )}
                                        {ts.externalUrl && (
                                            <a
                                                className={styles.spotifyLink}
                                                href={ts.externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Open on Spotify"
                                            >
                                                &#8599;
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
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
export default connect(mapStateToProps, mapDispatchToProps)(Profile)
