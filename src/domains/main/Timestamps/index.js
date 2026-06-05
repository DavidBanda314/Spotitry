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
            <div className={styles.cardGrid}>
                {timestampsBySong?.length !== 0 && 
                timestampsBySong?.map((tsGroup, key) => {
                    var entries = Object.values(tsGroup)
                    var song = entries[0]?.song
                    var album = song?.album
                    var songName = song?.name
                    var albumCover = album?.images[0]?.url
                    return(
                        <div className={styles.timestampCard} key={key}>
                            <img
                                className={styles.cardImage}
                                src={albumCover}
                                alt="Album Cover"
                            />
                            <p className={styles.cardTitle}>{songName}</p>
                            <p className={styles.cardSubtitle}>
                                {entries[0]?.song.artists[0]?.name ? entries[0].song.artists[0].name: entries[0].song.album.artists[0].name}
                            </p>
                            <p className={styles.cardSubtitle}>{album?.name}</p>
                            <p className={styles.timestampsLabel}>Timestamps:</p>
                            {entries.map((timestamp, key) => {
                                var totalTime = song.duration_ms
                                var timeSet = timestamp.position_ms
                                var track = song
                                return(
                                    <div key={key}>
                                        <Button
                                            className={styles.timestampButton}
                                            onClick={() => {
                                                if(!selectedSong) {
                                                }
                                                else{
                                                    setSelectedSong(0,track?.uri,track);
                                                    playSong(token,timeSet,track?.uri,track)
                                                }}

                                            }
                                        >
                                            Timestamp #{key+1} {millisToMinutesAndSeconds(timeSet)} of {millisToMinutesAndSeconds(totalTime)}
                                        </Button>

                                    </div>
                                )
                            })

                            }
                        </div>
                    )
                })}
            </div>
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
