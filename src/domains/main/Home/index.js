import React from 'react'
import { withRouter } from 'react-router-dom'
import styles from './index.module.css'
import { playSongRequested , setSelectedSong, getPlaybackInfoRequested} from '../redux/Actions/PlaybackActions.js'
import { connect } from 'react-redux'
import { SkeletonGrid } from '../../../components/Skeleton'


function formatTimestamp(ms) {
    return Math.floor(ms / 60000) + ":" + Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
}

function getRecentTimestamps(timestamps) {
    if (!timestamps) return [];
    var all = [];
    Object.values(timestamps).forEach(function(songGroup) {
        Object.entries(songGroup).forEach(function(inner) {
            all.push({ key: inner[0], ts: inner[1] });
        });
    });
    // Firebase push keys are chronologically ordered, so sorting the keys
    // descending yields the most recently saved timestamps first.
    all.sort(function(a, b) {
        if (a.key < b.key) return 1;
        if (a.key > b.key) return -1;
        return 0;
    });
    return all.slice(0, 6).map(function(e) { return e.ts; });
}

const Home = (props) => {
    var { token, topTracks, topArtists, setSelectedSong, selectedSong, getPlaybackInfo, playSong, timestamps, loading, history } = props
    var recentTimestamps = getRecentTimestamps(timestamps);
    const isTracksLoading = loading && topTracks.length === 0
    const isArtistsLoading = loading && topArtists.length === 0
    return(
        <div className={styles.container}>
            {recentTimestamps.length > 0 && (
                <div>
                    <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>Recent Timestamps</h4>
                    </div>
                    <div className={styles.timestampRow}>
                        {recentTimestamps.map(function(ts, idx) {
                            var song = ts.song;
                            var albumArt = song?.album?.images?.[song.album.images.length - 1]?.url || song?.album?.images?.[0]?.url;
                            return (
                                <div
                                    className={styles.timestampCard}
                                    key={idx}
                                    onClick={function() {
                                        setSelectedSong(ts.position_ms, song?.uri, song);
                                        playSong(token, ts.position_ms, song?.uri, song);
                                    }}
                                >
                                    {albumArt && <img className={styles.timestampArt} alt="Album" src={albumArt} />}
                                    <div className={styles.timestampInfo}>
                                        <p className={styles.timestampSong}>{song?.name}</p>
                                        <p className={styles.timestampTime}>{formatTimestamp(ts.position_ms)}</p>
                                        {ts.note && <p className={styles.timestampNote}>"{ts.note}"</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Your Top Songs</h4>
            </div>
            {isTracksLoading ? (
                <SkeletonGrid count={10} className={styles.grid} lines={3} />
            ) : (
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
                                <p className={styles.cardSubtitle}>
                                    <span
                                        className={styles.artistLink}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            history.push('/artist/' + track.artists[0].id);
                                        }}
                                    >
                                        {track.artists[0].name}
                                    </span>
                                </p>
                                <p className={styles.cardMeta}>{track.album.name}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
            )}

            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Your Top Artists</h4>
            </div>
            {isArtistsLoading ? (
                <SkeletonGrid count={10} className={styles.grid} circle lines={1} />
            ) : (
            <div className={styles.grid}>
                {topArtists.slice(0,10)?.map((artist,key) => {
                    return(
                        <div
                            className={styles.card}
                            key={key}
                            onClick={() => {
                                history.push('/artist/' + artist.id);
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
            )}
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
        selectedSong: state.Player.selectedSong,
        timestamps: state.User.databaseUser.timestamps,
        loading: state.User.loading,
    }
}
export default withRouter(connect(mapStateToProps,mapDispatchToProps)(Home));
