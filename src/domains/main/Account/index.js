import React, { useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import styles from './index.module.css'
import { connect } from 'react-redux'
import emptyProfile from '../../../images/empty_profile.jpeg'
import { setProfilePublic, updatePublicProfile, getIsPublic } from '../../../firebase'
import { getTheme, toggleTheme } from '../../../utils/theme'

const Account = (props) => {
    const { profile, databaseUser, topArtists, topTracks } = props
    const [isPublic, setIsPublic] = useState(false)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [theme, setThemeState] = useState(getTheme())
    const history = useHistory()

    const handleThemeToggle = () => {
        setThemeState(toggleTheme())
    }

    const userId = databaseUser?.userId

    const refreshPublicProfile = useCallback(async () => {
        if (!userId || !profile?.display_name) return
        const profileData = {
            displayName: profile.display_name,
            profileImage: profile?.images?.[0]?.url || '',
            topTracks: (topTracks || []).slice(0, 5).map(t => ({
                name: t.name,
                artist: t.artists?.[0]?.name || '',
                albumArt: t.album?.images?.[0]?.url || '',
                uri: t.uri,
                externalUrl: t.external_urls?.spotify || ''
            })),
            topArtists: (topArtists || []).slice(0, 5).map(a => ({
                name: a.name,
                image: a.images?.[0]?.url || '',
                externalUrl: a.external_urls?.spotify || ''
            })),
            sharedTimestamps: Object.entries(databaseUser?.timestamps ?? {}).reduce((acc, [, songGroup]) => {
                Object.values(songGroup ?? {}).forEach(ts => {
                    if (acc.length < 10) {
                        acc.push({
                            songName: ts.song?.name || '',
                            artist: ts.song?.artists?.[0]?.name || '',
                            position_ms: ts.position_ms,
                            note: ts.note || '',
                            uri: ts.song?.uri || '',
                            externalUrl: ts.song?.external_urls?.spotify || ''
                        })
                    }
                })
                return acc
            }, [])
        }
        await updatePublicProfile(userId, profileData)
    }, [userId, profile, topTracks, topArtists, databaseUser])

    useEffect(() => {
        if (userId) {
            getIsPublic(userId).then((val) => {
                setIsPublic(val)
                setLoading(false)
            })
        }
    }, [userId])

    useEffect(() => {
        if (!loading && isPublic && userId) {
            refreshPublicProfile()
        }
    }, [loading, isPublic, userId, refreshPublicProfile])

    const handleToggle = async () => {
        const newValue = !isPublic
        setIsPublic(newValue)
        await setProfilePublic(userId, newValue)
        if (newValue) {
            await refreshPublicProfile()
        }
    }

    const handleCopyLink = () => {
        const url = `https://spotitry-4ca96.web.app/profile/${userId}`
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('expiration')
        localStorage.removeItem('refresh_token')
        window.location.href = '/'
    }

    const followersCount = profile?.followers?.total ?? 0
    const savedCount = Object.values(databaseUser?.timestamps ?? {}).reduce(
        (total, songGroup) => total + Object.keys(songGroup ?? {}).length,
        0
    )
    const topArtistsCount = topArtists?.length ?? 0

    return(
        <div className={styles.header}>
            <div className={styles.banner}>
                <div className={styles.row}>
                    <img className={styles.profilePic} alt="Profile" src={Object.keys(profile).length ? profile?.images[0]?.url : emptyProfile} ></img>
                    { Object.keys(profile).length ?
                    <div>
                        <div className={styles.name} >{`${profile?.display_name}`}</div>
                        <div className={styles.email}>{profile?.email}</div>
                    </div>
                    :
                    <div>
                        <div className={styles.name} >{"Loading..."}</div>
                        <div className={styles.email}>{"Loading..."}</div>
                    </div>
                    }
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>{followersCount}</div>
                            <div className={styles.statLabel}>Followers</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>{savedCount}</div>
                            <div className={styles.statLabel}>Saved</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>{topArtistsCount}</div>
                            <div className={styles.statLabel}>Top Artists</div>
                        </div>
                    </div>
                </div>

                <div className={styles.themeSection}>
                    <div className={styles.themeRow}>
                        <span className={styles.themeLabel}>Theme</span>
                        <button
                            className={styles.themeToggleBtn}
                            onClick={handleThemeToggle}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            <FontAwesomeIcon
                                icon={theme === 'light' ? faMoon : faSun}
                                className={styles.themeToggleIcon}
                            />
                            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </button>
                    </div>
                </div>

                <div className={styles.publicProfileSection}>
                    <div className={styles.toggleRow}>
                        <span className={styles.toggleLabel}>Public Profile</span>
                        <button
                            className={`${styles.toggle} ${isPublic ? styles.toggleOn : ''}`}
                            onClick={handleToggle}
                            disabled={loading}
                            aria-label="Toggle public profile"
                        >
                            <span className={styles.toggleKnob} />
                        </button>
                    </div>
                    {isPublic && userId && (
                        <div className={styles.profileUrl}>
                            <span className={styles.urlText}>
                                https://spotitry-4ca96.web.app/profile/{userId}
                            </span>
                            <button className={styles.copyButton} onClick={handleCopyLink}>
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    )}
                </div>

                <button className={styles.compareButton} onClick={() => history.push('/compare')}>
                    Compare Tastes
                </button>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </div>

    )
}

const mapStateToProps = (state) => {
    return {
        profile: state?.User?.profile,
        databaseUser: state?.User?.databaseUser,
        topArtists: state?.User?.topArtists,
        topTracks: state?.User?.topTracks
    }
}

export default connect(mapStateToProps,null)(Account);
