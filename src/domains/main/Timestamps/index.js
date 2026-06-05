import React, { useEffect, useState } from 'react'
import styles from '../Timestamps/index.module.css'
import { connect } from 'react-redux'
import { getProfileRequested } from '../redux/Actions/UserActions'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'
import { InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'


const Timestamps = (props) => {
    const {token, timestamps, playSong, setSelectedSong, selectedSong} = props
    const [timestampsBySong,setTimeStampsBySong] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [allTimeStampsBySong,setAllTimeStampsBySong] = useState('')
    useEffect(() => {   
        if(!searchValue && timestamps){
            var tempArr2 = []
            var tempArr = Object?.values(timestamps)
            tempArr.map((timestamps) => (
                tempArr2.push(Object?.values(timestamps))
            ))
               setTimeStampsBySong(tempArr2)
               setAllTimeStampsBySong(tempArr2)
        }
    },[timestamps,searchValue])
    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    return(
    
        <div className={styles.container}>     
            <div className={styles.searchWrapper}>
                <InputGroup>
                    <InputGroupAddon addonType="append">
                        <Button>
                            <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
                        </Button>
                    </InputGroupAddon>
                    <Input placeholder = "Search timestamps..." onChange={(event) => {
                        var temp = allTimeStampsBySong?.filter((timestamps) => (timestamps[0].song.name.toLowerCase().includes(event.target.value.toLowerCase())))
                        setTimeStampsBySong(temp)
                        setSearchValue(event.target.value)
                    }}></Input>
                </InputGroup>
            </div>
            {(!timestampsBySong || timestampsBySong.length === 0) ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>♪</span>
                    {searchValue ? (
                        <>
                            <span className={styles.emptyTitle}>No timestamps match your search</span>
                            <span className={styles.emptySubtitle}>Try a different song name.</span>
                        </>
                    ) : (
                        <>
                            <span className={styles.emptyTitle}>No saved timestamps yet</span>
                            <span className={styles.emptySubtitle}>Save a moment from a song and it will show up here.</span>
                        </>
                    )}
                </div>
            ) : (
            <div className={styles.grid}>
                    {timestampsBySong?.map((tsGroup, key) => {
                        var entries = Object.values(tsGroup)
                        var song = entries[0]?.song
                        var album = song?.album
                        var songName = song?.name
                        var albumCover = album?.images[0]?.url
                        var artistName = entries[0]?.song.artists[0]?.name ? entries[0].song.artists[0].name : entries[0].song.album.artists[0].name
                        return(
                            <div className={styles.card} key={key}>
                                <div className={styles.cardHeader}>
                                    {albumCover &&
                                        <img src={albumCover} alt="" className={styles.cover}/>
                                    }
                                    <div className={styles.cardMeta}>
                                        <span className={styles.songTitle}>{songName}</span>
                                        <span className={styles.artistName}>{artistName}</span>
                                        <span className={styles.albumName}>{album?.name}</span>
                                    </div>
                                </div>
                                <div className={styles.timestampList}>
                                    {entries.map((timestamp, key) => {
                                        var totalTime = song.duration_ms
                                        var timeSet = timestamp.position_ms
                                        var track = song
                                        return(
                                            <div className={styles.timestampItem} key={key}>
                                                <button
                                                    className={styles.timestampButton}
                                                    onClick={() => {
                                                        if(!selectedSong) {
                                                        }
                                                        else{
                                                            setSelectedSong(0,track?.uri,track);
                                                            playSong(token,timeSet,track?.uri,track)
                                                        }
                                                    }}
                                                >
                                                    <span className={styles.playIcon}>▶</span>
                                                    <span className={styles.timeLabel}>{millisToMinutesAndSeconds(timeSet)} / {millisToMinutesAndSeconds(totalTime)}</span>
                                                </button>
                                                {timestamp.note && (
                                                    <span className={styles.note}>"{timestamp.note}"</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
            </div>
            )}
        </div>

    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        playSong: (token, deviceId, songURI, song) => dispatch(playSongRequested(token, deviceId, songURI,song)),
        refetchUser: (token) => dispatch(getProfileRequested(token)),
        setSelectedSong: (token, songURI, song) => dispatch(setSelectedSong(token, songURI, song))
    }
}
const mapStateToProps = (state) => {
    return {
        timestamps:state.User.databaseUser.timestamps,
        token:state.User.token,
        selectedSong: state.Player.selectedSong
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Timestamps);
