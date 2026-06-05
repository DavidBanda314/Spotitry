import React, { useEffect, useState, useMemo } from 'react'
import styles from '../Timestamps/index.module.css'
import { connect } from 'react-redux'
import { getProfileRequested } from '../redux/Actions/UserActions'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'
import { InputGroup, InputGroupAddon, Input, Button } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faListUl } from '@fortawesome/free-solid-svg-icons'
import { Card, CardImg, CardBody, CardTitle, CardSubtitle, CardText } from 'reactstrap'
import CreatePlaylistModal from '../../../components/CreatePlaylistModal'


const Timestamps = (props) => {
    const {token, timestamps, playSong, setSelectedSong, selectedSong, userId} = props
    const [timestampsBySong,setTimeStampsBySong] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [allTimeStampsBySong,setAllTimeStampsBySong] = useState('')
    const [showPlaylistModal, setShowPlaylistModal] = useState(false)

    const uniqueTrackUris = useMemo(() => {
        if (!timestamps) return []
        const uris = new Set()
        Object.values(timestamps).forEach((songGroup) => {
            Object.values(songGroup).forEach((entry) => {
                if (entry.song && entry.song.uri) {
                    uris.add(entry.song.uri)
                }
            })
        })
        return Array.from(uris)
    }, [timestamps])
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
            <button
                className={styles.createPlaylistBtn}
                onClick={() => setShowPlaylistModal(true)}
                disabled={uniqueTrackUris.length === 0 || !userId}
            >
                <FontAwesomeIcon icon={faListUl} style={{marginRight: '8px'}} />
                Create Playlist
            </button>
            <CreatePlaylistModal
                isOpen={showPlaylistModal}
                onClose={() => setShowPlaylistModal(false)}
                defaultName="My Spotitry Timestamps"
                token={token}
                userId={userId}
                trackUris={uniqueTrackUris}
            />
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
                                <Card style={{width:'100%', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#FFFFFF'}}>
                                    <CardImg top width="100%" src={albumCover} alt="Album Cover" style={{width:'100%', borderRadius: '12px 12px 0 0'}} className={styles.image}/>
                                    <CardBody>
                                        <CardTitle tag="h5" style={{color: '#FFFFFF', fontWeight: 700}}>{songName}</CardTitle>
                                        <CardSubtitle tag="h6" style={{color: 'rgba(255,255,255,0.6)', marginBottom: '8px'}}>{entries[0]?.song.artists[0]?.name ? entries[0].song.artists[0].name: entries[0].song.album.artists[0].name}</CardSubtitle>
                                        <CardSubtitle tag="h6" style={{color: 'rgba(255,255,255,0.4)', marginBottom: '8px'}}>{album?.name}</CardSubtitle>
                                        <CardText style={{color: 'rgba(255,255,255,0.6)'}}>Timestamps:</CardText>
                                        {entries.map((timestamp, key) => {
                                            var totalTime = song.duration_ms
                                            var timeSet = timestamp.position_ms
                                            var track = song
                                            return(
                                                <div className="column" key={key}>
                                                    <Button
                                                        style={{backgroundColor:'#1a1a1a', color: '#FFFFFF', marginBottom:'4px', height: '50px', fontSize:'13px', borderRadius: '500px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600}}
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
                                                            color: 'rgba(255,255,255,0.5)',
                                                            fontSize: '12px',
                                                            fontStyle: 'italic',
                                                            marginBottom: '10px',
                                                            paddingLeft: '12px',
                                                        }}>
                                                            "{timestamp.note}"
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
        selectedSong: state.Player.selectedSong,
        userId: state.User.profile?.id
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Timestamps);
