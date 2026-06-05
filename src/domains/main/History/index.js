import React, {useState, useEffect, useMemo } from 'react'
import styles from '../History/index.module.css'
import { connect } from 'react-redux'
import { getProfileRequested, StoreToken } from '../redux/Actions/UserActions'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faListUl, faMusic } from '@fortawesome/free-solid-svg-icons'
import DisplayCard from '../../../components/DisplayCard';
import CreatePlaylistModal from '../../../components/CreatePlaylistModal'
import { SkeletonGrid } from '../../../components/Skeleton';

const History = (props) => {
    const {token,history, StoreToken, setSelectedSong, selectedSong, userId, loading} = props
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
    const isLoading = loading && (!history || history.length === 0)
    const isEmpty = !isLoading && (!myHistory || myHistory.length === 0)
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
            <div className={styles.searchField}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search your history..."
                    onChange={(event) => {
                        var temp = history?.filter((track) => (track.track.name.toLowerCase().includes(event.target.value.toLowerCase())))
                        setMyHistory(temp)
                        setSearchValue(event.target.value)
                    }}
                />
            </div>

            {isLoading ? (
                <SkeletonGrid count={10} className={styles.cardGrid} lines={3} />
            ) : isEmpty ? (
                <div className={styles.emptyState}>
                    <FontAwesomeIcon icon={faMusic} className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>
                        {searchValue ? 'No matches found' : 'No listening history yet'}
                    </p>
                    <p className={styles.emptySubtitle}>
                        {searchValue
                            ? `Nothing in your history matches “${searchValue}”.`
                            : 'Play some songs on Spotify and your recently played tracks will show up here.'}
                    </p>
                </div>
            ) : (
            <div className={styles.cardGrid}>
                {myHistory.slice(0,20).map((track,key) => {
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
            )}
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
      userId: state.User.profile?.id,
      loading: state.User.loading
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(History);
