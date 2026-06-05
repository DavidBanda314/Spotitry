import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions';
import styles from './index.module.css';

function formatTimestamp(ms) {
    return Math.floor(ms / 60000) + ':' + Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
}

function formatFollowers(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
}

const Artist = () => {
    const { id } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();
    const token = useSelector((state) => state.User.token);
    const timestamps = useSelector((state) => state.User.databaseUser.timestamps);

    const [artist, setArtist] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [relatedArtists, setRelatedArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchArtistData = useCallback(async () => {
        if (!token || !id) return;
        setLoading(true);
        setError(null);
        try {
            const headers = { Authorization: 'Bearer ' + token };
            const [artistRes, tracksRes, relatedRes] = await Promise.all([
                fetch('https://api.spotify.com/v1/artists/' + id, { headers }),
                fetch('https://api.spotify.com/v1/artists/' + id + '/top-tracks?market=US', { headers }),
                fetch('https://api.spotify.com/v1/artists/' + id + '/related-artists', { headers }),
            ]);
            if (!artistRes.ok) throw new Error('Failed to fetch artist');
            const artistData = await artistRes.json();
            setArtist(artistData);

            if (tracksRes.ok) {
                const tracksData = await tracksRes.json();
                setTopTracks(tracksData.tracks || []);
            }
            if (relatedRes.ok) {
                const relatedData = await relatedRes.json();
                setRelatedArtists((relatedData.artists || []).slice(0, 6));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, id]);

    useEffect(() => {
        fetchArtistData();
    }, [fetchArtistData]);

    const handlePlayTrack = (track) => {
        dispatch(setSelectedSong(0, track.uri, track));
        dispatch(playSongRequested(token, 0, track.uri, track));
    };

    const handleRelatedClick = (artistId) => {
        history.push('/artist/' + artistId);
    };

    const getArtistTimestamps = () => {
        if (!timestamps || !id) return [];
        var results = [];
        Object.values(timestamps).forEach(function (songGroup) {
            Object.values(songGroup).forEach(function (ts) {
                if (ts.song && ts.song.artists) {
                    var match = ts.song.artists.some(function (a) { return a.id === id; });
                    if (match) results.push(ts);
                }
            });
        });
        return results;
    };

    var artistTimestamps = getArtistTimestamps();

    if (loading) {
        return <div className={styles.container}><p className={styles.loading}>Loading...</p></div>;
    }
    if (error) {
        return <div className={styles.container}><p className={styles.error}>{error}</p></div>;
    }
    if (!artist) {
        return <div className={styles.container}><p className={styles.error}>Artist not found</p></div>;
    }

    var artistImage = artist.images && artist.images.length > 0 ? artist.images[0].url : null;

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => history.goBack()}>
                &larr; Back
            </button>

            <div className={styles.header}>
                {artistImage && (
                    <img className={styles.artistImage} src={artistImage} alt={artist.name} />
                )}
                <h1 className={styles.artistName}>{artist.name}</h1>
                {artist.genres && artist.genres.length > 0 && (
                    <div className={styles.genres}>
                        {artist.genres.slice(0, 5).map(function (genre) {
                            return <span className={styles.genreChip} key={genre}>{genre}</span>;
                        })}
                    </div>
                )}
                {artist.followers && (
                    <p className={styles.followers}>{formatFollowers(artist.followers.total)} followers</p>
                )}
            </div>

            {topTracks.length > 0 && (
                <>
                    <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>Top Tracks</h4>
                    </div>
                    <div className={styles.trackList}>
                        {topTracks.slice(0, 10).map(function (track, i) {
                            var albumImg = track.album && track.album.images && track.album.images.length > 0
                                ? track.album.images[track.album.images.length - 1].url
                                : null;
                            return (
                                <div className={styles.trackItem} key={track.id} onClick={() => handlePlayTrack(track)}>
                                    <span className={styles.trackRank}>{i + 1}</span>
                                    {albumImg && <img className={styles.trackImage} src={albumImg} alt={track.name} />}
                                    <div className={styles.trackInfo}>
                                        <p className={styles.trackName}>{track.name}</p>
                                        <p className={styles.trackAlbum}>{track.album.name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {relatedArtists.length > 0 && (
                <>
                    <div className={styles.sectionHeader}>
                        <h4 className={styles.sectionTitle}>Related Artists</h4>
                    </div>
                    <div className={styles.relatedRow}>
                        {relatedArtists.map(function (ra) {
                            var raImg = ra.images && ra.images.length > 0
                                ? ra.images[ra.images.length - 1].url
                                : null;
                            return (
                                <div className={styles.relatedCard} key={ra.id} onClick={() => handleRelatedClick(ra.id)}>
                                    {raImg && <img className={styles.relatedImage} src={raImg} alt={ra.name} />}
                                    <p className={styles.relatedName}>{ra.name}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Your Timestamps</h4>
            </div>
            {artistTimestamps.length === 0 ? (
                <p className={styles.empty}>No saved timestamps for this artist</p>
            ) : (
                artistTimestamps.map(function (ts, idx) {
                    var song = ts.song;
                    var albumArt = song && song.album && song.album.images
                        ? (song.album.images[song.album.images.length - 1] || song.album.images[0] || {}).url
                        : null;
                    return (
                        <div
                            className={styles.timestampCard}
                            key={idx}
                            onClick={function () {
                                dispatch(setSelectedSong(0, song.uri, song));
                                dispatch(playSongRequested(token, ts.position_ms, song.uri, song));
                            }}
                        >
                            {albumArt && <img className={styles.timestampArt} src={albumArt} alt={song.name} />}
                            <div className={styles.timestampInfo}>
                                <p className={styles.timestampSong}>{song.name}</p>
                                <p className={styles.timestampTime}>{formatTimestamp(ts.position_ms)}</p>
                                {ts.note && <p className={styles.timestampNote}>"{ts.note}"</p>}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Artist;
