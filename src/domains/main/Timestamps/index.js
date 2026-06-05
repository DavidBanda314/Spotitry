import React, { useEffect, useState } from 'react'
import styles from '../Timestamps/index.module.css'
import { connect } from 'react-redux'
import { getProfileRequested } from '../redux/Actions/UserActions'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'
import { InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { Card, CardImg, CardBody, CardTitle, CardSubtitle, CardText } from 'reactstrap'


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
            <div className={styles.grid}>
                    {timestampsBySong?.length !== 0 && 
                    timestampsBySong?.map((tsGroup, key) => {
                        var entries = Object.values(tsGroup)
                        var song = entries[0]?.song
                        var album = song?.album
                        var songName = song?.name
                        var albumCover = album?.images[0]?.url
                        return(
                            <div className={styles.cardWrapper} key={key}>
                                <Card style={{width:'100%', backgroundColor: '#000000', border: 'none', borderRadius: '0', color: '#FFFFFF'}}>
                                    <CardImg top width="100%" src={albumCover} alt="Album Cover" style={{width:'100%', borderRadius: '0'}} className={styles.image}/>
                                    <CardBody>
                                        <CardTitle tag="h5" style={{color: '#FFFFFF', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase'}}>#{String(key+1).padStart(2,'0')} {songName}</CardTitle>
                                        <CardSubtitle tag="h6" style={{color: '#84898e', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase'}}>{entries[0]?.song.artists[0]?.name ? entries[0].song.artists[0].name: entries[0].song.album.artists[0].name}</CardSubtitle>
                                        <CardSubtitle tag="h6" style={{color: '#84898e', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase'}}>{album?.name}</CardSubtitle>
                                        <CardText style={{color: '#ffc700', fontSize: '12px', textTransform: 'uppercase'}}>{'///TIMESTAMPS'}</CardText>
                                        {entries.map((timestamp, key) => {
                                            var totalTime = song.duration_ms
                                            var timeSet = timestamp.position_ms
                                            var track = song
                                            return(
                                                <div className="column" key={key}>
                                                    <Button
                                                        style={{backgroundColor:'#000000', color: '#FFFFFF', marginBottom:'4px', height: '46px', fontSize:'12px', borderRadius: '0', border: '1px solid rgba(132,137,142,0.4)', fontWeight: 700, textTransform: 'uppercase', width: '100%'}}
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
                                                    {timestamp.note && (
                                                        <div style={{
                                                            color: '#84898e',
                                                            fontSize: '11px',
                                                            marginBottom: '10px',
                                                            paddingLeft: '12px',
                                                            textTransform: 'uppercase',
                                                        }}>
                                                            &gt; {timestamp.note}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })

                                        }
                                    </CardBody>
                                </Card>
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
