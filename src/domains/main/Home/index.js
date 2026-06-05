import React, { useEffect, useState } from 'react'
import styles from './index.module.css'
import { playSongRequested , setSelectedSong, getPlaybackInfoRequested} from '../redux/Actions/PlaybackActions.js'
import { connect } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';


const Home = (props) => {
    var { token, topTracks, topArtists, setSelectedSong, selectedSong, getPlaybackInfo, playSong } = props
    return(

        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Your Top Songs</h2>
            <div className={styles.cardGrid}>
                {topTracks.slice(0,10)?.map((track,key) => {
                    return(
                        <div
                            key={key}
                            className={styles.card}
                            onClick={() => (
                                (selectedSong?.song?.album?.uri == track.album.uri ?
                                (setSelectedSong(0,track.uri,track), getPlaybackInfo(token,0,0) )
                                
                                :
                                setSelectedSong(track.track_number-1,track.album?.uri,track),
                                getPlaybackInfo(token,0,0) 
    
                                ) 
                            )}
                        >
                            <img
                                className={styles.cardImage}
                                src={track.album.images[0].url}
                                alt="Album Cover"
                            />
                            <p className={styles.cardTitle}>
                                <span className={styles.rank}>{key+1}.</span> {track.name}
                            </p>
                            <p className={styles.cardSubtitle}>{track.artists[0].name}</p>
                            <p className={styles.cardSubtitle}>{track.album.name}</p>
                        </div>
                    )
                })}
            </div>

            <h2 className={styles.sectionTitle}>Your Top Artists</h2>
            <div className={styles.cardGrid}>
                {topArtists.slice(0,10)?.map((artist,key) => {
                    return(
                        <div
                            key={key}
                            className={styles.card}
                            onClick={() => (
                                setSelectedSong(Math.floor(Math.random() * 10),artist.uri,artist), 
                                getPlaybackInfo(token,0,0) 
                            )}
                        >
                            <img
                                className={styles.cardImageRound}
                                src={artist.images[0].url}
                                alt="Artist"
                            />
                            <p className={styles.cardTitle}>
                                <span className={styles.rank}>{key+1}.</span> {artist.name}
                            </p>
                            <p className={styles.cardSubtitle}>Artist</p>
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
        setSelectedSong: (token, songURI, song) => dispatch(setSelectedSong(token, songURI, song)),
        getPlaybackInfo: (token,create,userId) => dispatch(getPlaybackInfoRequested(token,create,userId)),
    }
}
const mapStateToProps = (state) => {
    return {
        token:state.User.token,
        topTracks:state.User.topTracks,
        topArtists: state.User.topArtists,
        selectedSong: state.Player.selectedSong

    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Home);
