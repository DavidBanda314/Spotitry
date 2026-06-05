import React from 'react'
import styles from './index.module.css'
import 'bootstrap/dist/css/bootstrap.min.css';


const DisplayCard = (props) => {
    const {track, artistName,albumName, albumCover, trackName, setSelectedSong, selectedSong} = props;
    return(
        <div
            className={styles.card}
            onClick={() => {
                selectedSong?.song?.album?.uri === track.album.uri ?
                    setSelectedSong(0,track.uri,track)
                    :
                    setSelectedSong(track.track_number-1,track.album?.uri,track);        
            }}
        >
            <img
                className={styles.cardImage}
                src={albumCover}
                alt="Album Cover"
            />
            <p className={styles.cardTitle}>{trackName}</p>
            <p className={styles.cardSubtitle}>{artistName}</p>
            <p className={styles.cardSubtitle}>{albumName}</p>
        </div>
    )
}

export default DisplayCard;
