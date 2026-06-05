import React, { useState, useEffect, useRef } from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import SearchBar from '../../../components/searchBar'
import { searchSongsRequested } from '../redux/Actions/UserActions.js'
import { getPlaybackInfoRequested, playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions.js'
import { Button } from '@material-ui/core'
import { SkeletonCard } from '../../../components/Skeleton'

const DEBOUNCE_MS = 300

const Discover = (props) => {
    const {searchSongs, getPlaybackInfo, token, searchedSongs, currentlyPlaying, userId, setSelectedSong, playbackInfo, searchLoading, searchError} = props
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
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

    const handleSelect = (song) => {
        setSelectedSong(song.track_number - 1, song.album.uri, song)
        setSelectedId(song.id)
    }

    const hasQuery = debouncedQuery.length > 0

    const renderResults = () => {
        if (!hasQuery) {
            return (
                <div className={styles.placeholder}>
                    Search for a song to play it or save a timestamp.
                </div>
            )
        }
        if (searchLoading) {
            return (
                <>
                    {[0, 1, 2, 3].map((i) => (
                        <SkeletonCard key={i} width="100%" height="64px" borderRadius="12px" />
                    ))}
                </>
            )
        }
        if (searchError) {
            return (
                <div className={styles.placeholder}>
                    Something went wrong while searching. Please try again.
                </div>
            )
        }
        if (!searchedSongs || searchedSongs.length === 0) {
            return (
                <div className={styles.placeholder}>
                    No songs match “{debouncedQuery}”.
                </div>
            )
        }
        return searchedSongs.map((song, key) => (
            <div
                className={`${styles.row} ${selectedId === song.id ? styles.rowSelected : ''}`}
                key={song.id || key}
                onClick={() => handleSelect(song)}
            >
                {song.album?.images?.[0]?.url ? (
                    <img alt="" src={song.album.images[0].url} className={styles.smallPic}/>
                ) : (
                    <div className={styles.smallPicFallback}>♪</div>
                )}
                <div className={styles.rowMeta}>
                    <span className={styles.rowTitle}>{song.name}</span>
                    <span className={styles.rowSubtitle}>{song.artists?.[0]?.name}</span>
                </div>
                {selectedId === song.id && (
                    <span className={styles.playingTag}>Playing</span>
                )}
            </div>
        ))
    }

    return(
        <div className={styles.container}>
            {currentlyPlaying ? (
                <div className={styles.nowPlaying}>
                    <img alt="" src={currentlyPlaying?.album?.images?.[1]?.url || currentlyPlaying?.album?.images?.[0]?.url} className={styles.pic}/>
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

            <div className={styles.searchResults}>
                {renderResults()}
            </div>

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
        getPlaybackInfo: (token,create,userId) => dispatch(getPlaybackInfoRequested(token,create,userId)),
        playSong: (token, deviceId, songURI, song) => dispatch(playSongRequested(token, deviceId, songURI,song)),
        setSelectedSong: (token, songURI, song) => dispatch(setSelectedSong(token, songURI, song))
    }
}

const mapStateToProps = (state) => {
    return {
        token:state.User.token,
        searchedSongs:state.User.searchedSongs,
        searchLoading:state.User.searchLoading,
        searchError:state.User.searchError,
        availableDevices: state.Player.availableDevices.devices,
        playbackInfo: state.Player.playbackInfo,
        currentlyPlaying: state.Player.playbackInfo?.item,
        userId: state.User.databaseUser.userId,
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Discover);
