import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import styles from './index.module.css'
import { connect } from 'react-redux'
import { setSelectedSong } from '../redux/Actions/PlaybackActions'
import { db } from '../../../utils/constants'

function parseUserId(input) {
    if (!input) return null
    var trimmed = input.trim()
    if (trimmed.includes('/profile/')) {
        var parts = trimmed.split('/profile/')
        var id = parts[parts.length - 1].replace(/\/+$/, '')
        if (!id) return null
        trimmed = id
    }
    if (/[/.#$[\]]/.test(trimmed)) return null
    return trimmed
}

function findSharedArtists(myArtists, theirArtists) {
    var shared = []
    var theirIds = {}
    var theirNames = {}
    theirArtists.forEach(function (a) {
        if (a.id) theirIds[a.id] = a
        if (a.name) theirNames[a.name.toLowerCase()] = a
    })
    var seen = {}
    myArtists.forEach(function (a) {
        var match = null
        if (a.id && theirIds[a.id]) {
            match = a
        } else if (a.name && theirNames[a.name.toLowerCase()]) {
            match = a
        }
        var artistKey = match ? (match.id || match.name || '').toLowerCase() : null
        if (match && artistKey && !seen[artistKey]) {
            seen[artistKey] = true
            shared.push(match)
        }
    })
    return shared
}

function findSharedTracks(myTracks, theirTracks) {
    var shared = []
    var theirIds = {}
    var theirKeys = {}
    theirTracks.forEach(function (t) {
        if (t.id) theirIds[t.id] = t
        var key = (t.name || '').toLowerCase() + '::' + ((t.artists && t.artists[0] && t.artists[0].name) || '').toLowerCase()
        theirKeys[key] = t
    })
    var seen = {}
    myTracks.forEach(function (t) {
        var match = null
        if (t.id && theirIds[t.id]) {
            match = t
        } else {
            var key = (t.name || '').toLowerCase() + '::' + ((t.artists && t.artists[0] && t.artists[0].name) || '').toLowerCase()
            if (theirKeys[key]) {
                match = t
            }
        }
        var dedupKey = match ? ((match.name || '').toLowerCase() + '::' + ((match.artists && match.artists[0] && match.artists[0].name) || '').toLowerCase()) : null
        if (match && dedupKey && !seen[dedupKey]) {
            seen[dedupKey] = true
            shared.push(match)
        }
    })
    return shared
}

function computeScore(sharedArtists, myArtists, theirArtists, sharedTracks, myTracks, theirTracks) {
    var artistMax = Math.max(myArtists.length, theirArtists.length)
    var trackMax = Math.max(myTracks.length, theirTracks.length)
    var artistScore = artistMax > 0 ? (sharedArtists.length / artistMax) * 50 : 0
    var trackScore = trackMax > 0 ? (sharedTracks.length / trackMax) * 50 : 0
    return Math.round(artistScore + trackScore)
}

function scoreColor(score) {
    if (score <= 30) return '#ff4444'
    if (score <= 60) return '#ffaa00'
    return '#1DB954'
}

const Compare = (props) => {
    var { topArtists, topTracks, selectSong, token } = props
    var history = useHistory()
    var myArtists = topArtists || []
    var myTracks = topTracks || []

    var [input, setInput] = useState('')
    var [loading, setLoading] = useState(false)
    var [error, setError] = useState(null)
    var [friendProfile, setFriendProfile] = useState(null)
    var [sharedArtists, setSharedArtists] = useState([])
    var [sharedTracks, setSharedTracks] = useState([])
    var [friendArtists, setFriendArtists] = useState([])
    var [friendTracks, setFriendTracks] = useState([])
    var [score, setScore] = useState(null)

    var handleCompare = function () {
        var friendId = parseUserId(input)
        if (!friendId) {
            setError('Please enter a valid user ID or profile URL')
            return
        }
        setLoading(true)
        setError(null)
        setFriendProfile(null)
        setScore(null)

        db.ref('users/' + friendId).once('value')
            .then(function (snapshot) {
                var data = snapshot.val()
                if (!data) {
                    setError('User not found')
                    setLoading(false)
                    return
                }
                if (!data.isPublic) {
                    setError("This user's profile is private")
                    setLoading(false)
                    return
                }
                var pub = data.publicProfile || {}
                var theirArtists = pub.topArtists || []
                var theirTracks = pub.topTracks || []

                var sa = findSharedArtists(myArtists, theirArtists)
                var st = findSharedTracks(myTracks, theirTracks)
                var s = computeScore(sa, myArtists, theirArtists, st, myTracks, theirTracks)

                setFriendProfile({
                    displayName: pub.displayName || friendId,
                    profileImage: pub.profileImage || null,
                })
                setFriendArtists(theirArtists)
                setFriendTracks(theirTracks)
                setSharedArtists(sa)
                setSharedTracks(st)
                setScore(s)
                setLoading(false)
            })
            .catch(function () {
                setError('Failed to fetch user data')
                setLoading(false)
            })
    }

    var handleTrackClick = function (track) {
        if (token && track) {
            selectSong(0, track.uri || track.songURI, track)
        }
    }

    var color = score !== null ? scoreColor(score) : '#84898e'

    var handleArtistClick = function (artist) {
        if (artist && artist.id) {
            history.push('/artist/' + artist.id)
        } else if (artist && artist.externalUrl) {
            window.open(artist.externalUrl, '_blank')
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.helpSection}>
                <div className={styles.helpTitle}>How it works</div>
                <p className={styles.helpText}>
                    Compare your music taste with a friend! Both of you need a Spotitry account.
                    Your friend must enable "Public Profile" in their Account page, then share
                    their profile link or user ID with you. Paste it below and hit Compare to see
                    your shared artists, tracks, and a compatibility score.
                </p>
            </div>
            <div className={styles.inputSection}>
                <div className={styles.sectionTitle}>Compare Tastes</div>
                <div className={styles.inputRow}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="Enter friend's user ID or profile URL..."
                        value={input}
                        onChange={function (e) { setInput(e.target.value) }}
                        onKeyDown={function (e) { if (e.key === 'Enter') handleCompare() }}
                    />
                    <button
                        className={styles.compareButton}
                        onClick={handleCompare}
                        disabled={loading || !input.trim()}
                    >
                        Compare
                    </button>
                </div>
            </div>

            {loading && (
                <div className={styles.loading}>Fetching friend's profile...</div>
            )}

            {error && (
                <div className={styles.error}>{error}</div>
            )}

            {score !== null && friendProfile && (
                <div className={styles.results}>
                    <div className={styles.scoreSection}>
                        <div className={styles.friendInfo}>
                            {friendProfile.profileImage && (
                                <img
                                    className={styles.friendImage}
                                    src={friendProfile.profileImage}
                                    alt={friendProfile.displayName}
                                />
                            )}
                            <span className={styles.friendName}>{friendProfile.displayName}</span>
                        </div>
                        <div
                            className={styles.scoreCircle}
                            style={{ borderColor: color }}
                        >
                            <span className={styles.scoreValue} style={{ color: color }}>
                                {score}%
                            </span>
                            <span className={styles.scoreLabel}>Match</span>
                        </div>
                    </div>

                    <div className={styles.sharedSection}>
                        <div className={styles.sharedHeader}>
                            <div className={styles.sectionTitle}>Shared Artists</div>
                        </div>
                        {sharedArtists.length > 0 ? (
                            <div className={styles.sharedGrid}>
                                {sharedArtists.map(function (artist, idx) {
                                    var img = artist.images && artist.images[0] ? artist.images[0].url : null
                                    return (
                                        <div className={styles.sharedArtistCard} key={artist.id || idx} onClick={function () { handleArtistClick(artist) }}>
                                            {img && (
                                                <img
                                                    className={styles.sharedArtistImage}
                                                    src={img}
                                                    alt={artist.name}
                                                />
                                            )}
                                            <span className={styles.sharedArtistName}>{artist.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className={styles.emptyMessage}>No shared artists</div>
                        )}
                    </div>

                    <div className={styles.sharedSection}>
                        <div className={styles.sharedHeader}>
                            <div className={styles.sectionTitle}>Shared Tracks</div>
                        </div>
                        {sharedTracks.length > 0 ? (
                            sharedTracks.map(function (track, idx) {
                                var img = track.album && track.album.images && track.album.images[0]
                                    ? track.album.images[0].url : null
                                var artistName = track.artists && track.artists[0] ? track.artists[0].name : ''
                                return (
                                    <div
                                        className={styles.sharedTrackCard}
                                        key={track.id || idx}
                                        onClick={function () { handleTrackClick(track) }}
                                    >
                                        {img && (
                                            <img
                                                className={styles.sharedTrackImage}
                                                src={img}
                                                alt={track.name}
                                            />
                                        )}
                                        <div className={styles.sharedTrackInfo}>
                                            <div className={styles.sharedTrackName}>{track.name}</div>
                                            <div className={styles.sharedTrackArtist}>{artistName}</div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className={styles.emptyMessage}>No shared tracks</div>
                        )}
                    </div>

                    <div className={styles.sideBySide}>
                        <div className={styles.sideBySideHeader}>
                            <div className={styles.sectionTitle}>Side by Side</div>
                        </div>
                        <div className={styles.subSectionTitle}>Top Artists</div>
                        <div className={styles.columns}>
                            <div className={styles.column}>
                                <div className={styles.columnHeader}>You</div>
                                {myArtists.slice(0, 5).map(function (a, idx) {
                                    var img = a.images && a.images[0] ? a.images[0].url : null
                                    return (
                                        <div className={styles.columnItem} key={a.id || idx} onClick={function () { handleArtistClick(a) }}>
                                            {img && <img className={styles.columnImageCircle} src={img} alt={a.name} />}
                                            <span className={styles.columnName}>{a.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className={styles.column}>
                                <div className={styles.columnHeader}>{friendProfile.displayName}</div>
                                {friendArtists.slice(0, 5).map(function (a, idx) {
                                    var img = a.images && a.images[0] ? a.images[0].url : null
                                    return (
                                        <div className={styles.columnItem} key={a.id || idx} onClick={function () { handleArtistClick(a) }}>
                                            {img && <img className={styles.columnImageCircle} src={img} alt={a.name} />}
                                            <span className={styles.columnName}>{a.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className={styles.subSectionTitle}>Top Tracks</div>
                        <div className={styles.columns}>
                            <div className={styles.column}>
                                <div className={styles.columnHeader}>You</div>
                                {myTracks.slice(0, 5).map(function (t, idx) {
                                    var img = t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : null
                                    var artistName = t.artists && t.artists[0] ? t.artists[0].name : ''
                                    return (
                                        <div className={styles.columnItem} key={t.id || idx} onClick={function () { handleTrackClick(t) }}>
                                            {img && <img className={styles.columnImage} src={img} alt={t.name} />}
                                            <div className={styles.columnItemInfo}>
                                                <div className={styles.columnName}>{t.name}</div>
                                                <div className={styles.columnSub}>{artistName}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className={styles.column}>
                                <div className={styles.columnHeader}>{friendProfile.displayName}</div>
                                {friendTracks.slice(0, 5).map(function (t, idx) {
                                    var img = t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : null
                                    var artistName = t.artists && t.artists[0] ? t.artists[0].name : ''
                                    return (
                                        <div className={styles.columnItem} key={t.id || idx} onClick={function () { handleTrackClick(t) }}>
                                            {img && <img className={styles.columnImage} src={img} alt={t.name} />}
                                            <div className={styles.columnItemInfo}>
                                                <div className={styles.columnName}>{t.name}</div>
                                                <div className={styles.columnSub}>{artistName}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        topArtists: state.User.topArtists,
        topTracks: state.User.topTracks,
        token: state.User.token,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        selectSong: (position, uri, song) => dispatch(setSelectedSong(position, uri, song)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Compare)
