import React, { useState, useEffect, useRef } from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import SearchBar from '../../../components/searchBar'
import { searchSongsRequested, getDiscoverFeedRequested } from '../redux/Actions/UserActions.js'
import { getPlaybackInfoRequested, playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions.js'
import { Button } from '@material-ui/core'
import { SkeletonCard } from '../../../components/Skeleton'

const DEBOUNCE_MS = 300
const TABS = [
    { key: 'tracks', label: 'Tracks' },
    { key: 'artists', label: 'Artists' },
    { key: 'albums', label: 'Albums' },
]

const Discover = (props) => {
    const {
        searchSongs, getPlaybackInfo, getDiscoverFeed, token,
        searchedSongs, searchedArtists, searchedAlbums, searchLoading, searchError,
        discoverFeed, discoverFeedType, discoverLoading,
        currentlyPlaying, userId, setSelectedSong, playbackInfo,
    } = props
    const history = useHistory()
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [activeTab, setActiveTab] = useState('tracks')
    const [selectedId, setSelectedId] = useState(null)
    const [playbackLoaded, setPlaybackLoaded] = useState(false)
    const playbackInfoRef = useRef(playbackInfo)

    useEffect(() => {
        if (playbackInfoRef.current !== playbackInfo) {
            setPlaybackLoaded(true)
        }
        playbackInfoRef.current = playbackInfo
    }, [playbackInfo])

    useEffect(() => {
        getPlaybackInfo(token)
        getDiscoverFeed(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS)
        return () => clearTimeout(handle)
    }, [query])

    useEffect(() => {
        if (debouncedQuery) {
            searchSongs(token, debouncedQuery)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery])

    const handleClear = () => {
        setQuery('')
        setDebouncedQuery('')
        setSelectedId(null)
    }

    const playTrack = (track) => {
        setSelectedSong(track.track_number - 1, track.album.uri, track)
        setSelectedId(track.id)
    }

    const playAlbum = (album) => {
        setSelectedSong(0, album.uri, album)
        setSelectedId(album.id)
    }

    const hasQuery = debouncedQuery.length > 0

    const trackRow = (track, key) => (
        <div
            className={`${styles.row} ${selectedId === track.id ? styles.rowSelected : ''}`}
            key={track.id || key}
            onClick={() => playTrack(track)}
        >
            {track.album?.images?.[0]?.url ? (
                <img alt="" src={track.album.images[0].url} className={styles.smallPic}/>
            ) : (
                <div className={styles.smallPicFallback}>♪</div>
            )}
            <div className={styles.rowMeta}>
                <span className={styles.rowTitle}>{track.name}</span>
                <span className={styles.rowSubtitle}>{track.artists?.[0]?.name}</span>
            </div>
            {selectedId === track.id && <span className={styles.playingTag}>Playing</span>}
        </div>
    )

    const albumRow = (album, key) => (
        <div
            className={`${styles.row} ${selectedId === album.id ? styles.rowSelected : ''}`}
            key={album.id || key}
            onClick={() => playAlbum(album)}
        >
            {album.images?.[0]?.url ? (
                <img alt="" src={album.images[0].url} className={styles.smallPic}/>
            ) : (
                <div className={styles.smallPicFallback}>♪</div>
            )}
            <div className={styles.rowMeta}>
                <span className={styles.rowTitle}>{album.name}</span>
                <span className={styles.rowSubtitle}>
                    {album.artists?.[0]?.name}
                    {album.external_urls?.spotify && (
                        <a
                            href={album.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.openLink}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Open Album
                        </a>
                    )}
                </span>
            </div>
            {selectedId === album.id && <span className={styles.playingTag}>Playing</span>}
        </div>
    )

    const artistRow = (artist, key) => (
        <div
            className={`${styles.row}`}
            key={artist.id || key}
            onClick={() => history.push(`/artist/${artist.id}`)}
        >
            {artist.images?.[0]?.url ? (
                <img alt="" src={artist.images[0].url} className={styles.smallPicRound}/>
            ) : (
                <div className={styles.smallPicFallbackRound}>♪</div>
            )}
            <div className={styles.rowMeta}>
                <span className={styles.rowTitle}>{artist.name}</span>
                <span className={styles.rowSubtitle}>Artist</span>
            </div>
        </div>
    )

    const skeletons = () => [0, 1, 2, 3].map((i) => (
        <SkeletonCard key={i} width="100%" height="64px" borderRadius="12px" />
    ))

    const renderSearch = () => {
        if (searchLoading) return skeletons()
        if (searchError) {
            return <div className={styles.placeholder}>Something went wrong while searching. Please try again.</div>
        }
        const data = activeTab === 'tracks' ? searchedSongs
            : activeTab === 'artists' ? searchedArtists
            : searchedAlbums
        if (!data || data.length === 0) {
            return <div className={styles.placeholder}>No {activeTab} match “{debouncedQuery}”.</div>
        }
        const renderer = activeTab === 'tracks' ? trackRow
            : activeTab === 'artists' ? artistRow
            : albumRow
        return data.map(renderer)
    }

    const renderDiscoverFeed = () => {
        if (discoverLoading) return skeletons()
        if (!discoverFeed || discoverFeed.length === 0) {
            return <div className={styles.placeholder}>Search for a song to play it or save a timestamp.</div>
        }
        const renderer = discoverFeedType === 'newReleases' ? albumRow : trackRow
        return discoverFeed.map(renderer)
    }

    const feedTitle = discoverFeedType === 'newReleases' ? 'New releases' : 'Made for you'

    return(
        <div className={styles.container}>
            {currentlyPlaying ? (
                <div className={styles.nowPlaying}>
                    <img alt="" src={currentlyPlaying?.album?.images?.[1]?.url || currentlyPlaying?.album?.images?.[0]?.url || currentlyPlaying?.images?.[1]?.url || currentlyPlaying?.images?.[0]?.url} className={styles.pic}/>
                    <div className={styles.nowPlayingMeta}>
                        <span className={styles.nowPlayingLabel}>Now playing</span>
                        <span className={styles.header}>{currentlyPlaying?.name}</span>
                    </div>
                </div>
            ) : !playbackLoaded ? (
                <SkeletonCard width="100%" height="120px" borderRadius="16px" />
            ) : null}

            <div className={styles.searchBar}>
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    onClear={handleClear}
                    onSubmit={(v) => setDebouncedQuery(v.trim())}
                />
            </div>

            {hasQuery ? (
                <>
                    <div className={styles.tabs}>
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className={styles.searchResults}>{renderSearch()}</div>
                </>
            ) : (
                <>
                    <span className={styles.sectionTitle}>{feedTitle}</span>
                    <div className={styles.searchResults}>{renderDiscoverFeed()}</div>
                </>
            )}

            {currentlyPlaying && (
                <Button
                    variant='contained'
                    className={styles.timestampButton}
                    onClick={() => getPlaybackInfo(token,1,userId)}
                >
                    Save Timestamp
                </Button>
            )}
        </div>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        searchSongs: (token, searchValue) => dispatch(searchSongsRequested(token,searchValue)),
        getDiscoverFeed: (token) => dispatch(getDiscoverFeedRequested(token)),
        getPlaybackInfo: (token,create,userId) => dispatch(getPlaybackInfoRequested(token,create,userId)),
        playSong: (token, deviceId, songURI, song) => dispatch(playSongRequested(token, deviceId, songURI,song)),
        setSelectedSong: (token, songURI, song) => dispatch(setSelectedSong(token, songURI, song))
    }
}

const mapStateToProps = (state) => {
    return {
        token:state.User.token,
        searchedSongs:state.User.searchedSongs,
        searchedArtists:state.User.searchedArtists,
        searchedAlbums:state.User.searchedAlbums,
        searchLoading:state.User.searchLoading,
        searchError:state.User.searchError,
        discoverFeed:state.User.discoverFeed,
        discoverFeedType:state.User.discoverFeedType,
        discoverLoading:state.User.discoverLoading,
        availableDevices: state.Player.availableDevices.devices,
        playbackInfo: state.Player.playbackInfo,
        currentlyPlaying: state.Player.playbackInfo?.item,
        userId: state.User.databaseUser.userId,
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Discover);
