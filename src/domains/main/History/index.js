import React, {useState, useEffect, useMemo } from 'react'
import styles from '../History/index.module.css'
import { connect } from 'react-redux'
import { getProfileRequested, StoreToken } from '../redux/Actions/UserActions'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'
import { InputGroup, InputGroupAddon,Input, Button } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faListUl } from '@fortawesome/free-solid-svg-icons'
import DisplayCard from '../../../components/DisplayCard';
import CreatePlaylistModal from '../../../components/CreatePlaylistModal'

const History = (props) => {
    const {token,history, StoreToken, setSelectedSong, selectedSong, userId} = props
    const [myHistory, setMyHistory] = useState(history)
    const [searchValue,setSearchValue] = useState('')
    const [showPlaylistModal, setShowPlaylistModal] = useState(false)

    const uniqueTrackUris = useMemo(() => {
        if (!history || !history.length) return []
        const uris = new Set()
        history.forEach((item) => {
            if (item.track && item.track.uri) {
                uris.add(item.track.uri)
            }
        })
        return Array.from(uris)
    }, [history])
    useEffect(() => {
        StoreToken(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    useEffect(() => {
        if(!searchValue){
            setMyHistory(history)
        }
    },[searchValue, history])
    console.log(myHistory)
    return(
        <>
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
                defaultName="My Recent Listens"
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
                    <Input placeholder = "Search your history..." onChange={(event) => {
                        var temp = history?.filter((track) => (track.track.name.toLowerCase().includes(event.target.value.toLowerCase())))
                        setMyHistory(temp)
                        setSearchValue(event.target.value)
                    }}></Input>
                </InputGroup>
            </div>

            <div className={styles.cardGrid}>
                { myHistory.length !== 0 && myHistory.slice(0,20).map((track,key) => {
                    var song = track.track
                    var album = song?.album
                    var artist = song?.artists[0]
                    
                    var songName = song?.name
                    var albumCover = album?.images[0]?.url
                    return(
                        <DisplayCard
                            key={key}
                            trackName = {songName}
                            albumCover = {albumCover}
                            artistName = {artist?.name ? artist.name:album.artists[0].name}
                            albumName = {album.name}
                            token = {token}
                            track = {song}
                            setSelectedSong = {setSelectedSong}
                            selectedSong={selectedSong}
                        />
                    )
                })}
            </div> 
        </div>
        </>
    )
}

const mapDispatchToProps = (dispatch) => {
  return {
      playSong: (token, deviceId, songURI, song) => dispatch(playSongRequested(token, deviceId, songURI,song)),
      refetchUser: (token) => dispatch(getProfileRequested(token)),
      StoreToken: (token) => dispatch(StoreToken(token)),
      setSelectedSong: (token, songURI, song) => dispatch(setSelectedSong(token, songURI, song))
  }
}
const mapStateToProps = (state) => {
  return {
      history: state.Player.recentlyPlayed,
      token:state.User.token,
      selectedSong:state.Player.selectedSong,
      userId: state.User.profile?.id
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(History);
