import React from 'react'
import styles from './index.module.css'
import { playSongRequested , setSelectedSong, getPlaybackInfoRequested} from '../redux/Actions/PlaybackActions.js'
import { connect } from 'react-redux'


const Home = (props) => {
    var { token, topTracks, topArtists, setSelectedSong, selectedSong, getPlaybackInfo } = props
    return(
        <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Your Top Songs</h4>
            </div>
            <div className={styles.grid}>
                {topTracks.slice(0,10)?.map((track,key) => {
                    return(
                        <div
                            className={styles.card}
                            key={key}
                            onClick={() => {
                                if (selectedSong?.song?.album?.uri === track.album.uri) {
                                    setSelectedSong(0,track.uri,track);
                                } else {
                                    setSelectedSong(track.track_number-1,track.album?.uri,track);
                                }
                                getPlaybackInfo(token,0,0);
                            }}
                        >
                            <img className={styles.cardImage} alt="Album Cover" src={track.album.images[0].url}/>
                            <div className={styles.cardBody}>
                                <p className={styles.cardTitle}>{key+1}. {track.name}</p>
                                <p className={styles.cardSubtitle}>{track.artists[0].name}</p>
                                <p className={styles.cardMeta}>{track.album.name}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Your Top Artists</h4>
            </div>
            <div className={styles.grid}>
                {topArtists.slice(0,10)?.map((artist,key) => {
                    return(
                        <div
                            className={styles.card}
                            key={key}
                            onClick={() => {
                                setSelectedSong(Math.floor(Math.random() * 10),artist.uri,artist);
                                getPlaybackInfo(token,0,0);
                            }}
                        >
                            <img className={`${styles.cardImage} ${styles.artistImage}`} alt="Artist Pic" src={artist.images[0].url}/>
                            <div className={styles.cardBody}>
                                <p className={styles.cardTitle}>{key+1}. {artist.name}</p>
                            </div>
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
