import React, { useState, useEffect, useRef } from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import SearchBar from '../../../components/searchBar'
import { searchSongsRequested } from '../redux/Actions/UserActions.js'
import { getPlaybackInfoRequested, playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions.js'
import { Button } from '@material-ui/core'
import { SkeletonCard } from '../../../components/Skeleton'


const Discover = (props) => {
    const {searchSongs, getPlaybackInfo, token, searchedSongs, currentlyPlaying,userId, setSelectedSong, playbackInfo} = props
    const [searchValue, setSearchValue] = useState('')
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
        if(searchValue){
            searchSongs(token,searchValue)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[searchValue])
    return(
        <div className={styles.container}>
            {currentlyPlaying ? (
                <div className={styles.nowPlaying}>
                    <img alt="" src={currentlyPlaying?.album?.images[1]?.url} className={styles.pic}/>
                    <div className={styles.nowPlayingMeta}>
                        <span className={styles.nowPlayingLabel}>Now playing</span>
                        <span className={styles.header}>{currentlyPlaying?.name}</span>
                    </div>
                </div>
            ) : !playbackLoaded ? (
                <SkeletonCard width="100%" height="120px" borderRadius="16px" />
            ) : null}

            <div className={styles.searchBar}>
                <SearchBar setSearchValue={setSearchValue}/>
            </div>

            <div className={styles.searchResults}>
                { searchValue &&
                    searchedSongs.map((song, key) => (
                        <div
                            className={styles.row} key={key}
                            onClick={() => {
                                setSelectedSong(song.track_number-1,song.album.uri,song)
                                setSearchValue('')
                            }}
                        >
                            <img alt="" src={song.album.images[0].url} className={styles.smallPic}/>
                            <div className={styles.rowMeta}>
                                <span className={styles.rowTitle}>#{String(key+1).padStart(2,'0')} {song.name}</span>
                                <span className={styles.rowSubtitle}>{song.artists?.[0]?.name}</span>
                            </div>
                        </div>
                    ))
                }
            </div>

            <Button
                variant='contained'
                className={styles.timestampButton}
                onClick={() => getPlaybackInfo(token,1,userId)}
            >
                Save Timestamp
            </Button>
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
        availableDevices: state.Player.availableDevices.devices,
        playbackInfo: state.Player.playbackInfo,
        currentlyPlaying: state.Player.playbackInfo?.item,
        userId: state.User.databaseUser.userId,
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Discover);
