import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import styles from './index.module.css';
import { TOP_TRACKS_ENDPOINT, TOP_ARTISTS_ENDPOINT } from '../../../utils/constants';

const TIME_RANGES = [
  { key: 'short_term', label: 'Last 4 Weeks' },
  { key: 'medium_term', label: 'Last 6 Months' },
  { key: 'long_term', label: 'All Time' },
];

const Stats = () => {
  const token = useSelector((state) => state.User.token);

  const [tracksRange, setTracksRange] = useState('short_term');
  const [artistsRange, setArtistsRange] = useState('short_term');
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [errorTracks, setErrorTracks] = useState(null);
  const [errorArtists, setErrorArtists] = useState(null);

  const fetchTopTracks = useCallback(async (range) => {
    if (!token) return;
    setLoadingTracks(true);
    setErrorTracks(null);
    try {
      const res = await fetch(
        `${TOP_TRACKS_ENDPOINT}?time_range=${range}&limit=10`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      if (!res.ok) throw new Error('Failed to fetch top tracks');
      const data = await res.json();
      setTopTracks(data.items || []);
    } catch (err) {
      setErrorTracks(err.message);
    } finally {
      setLoadingTracks(false);
    }
  }, [token]);

  const fetchTopArtists = useCallback(async (range) => {
    if (!token) return;
    setLoadingArtists(true);
    setErrorArtists(null);
    try {
      const res = await fetch(
        `${TOP_ARTISTS_ENDPOINT}?time_range=${range}&limit=10`,
        { headers: { Authorization: 'Bearer ' + token } }
      );
      if (!res.ok) throw new Error('Failed to fetch top artists');
      const data = await res.json();
      setTopArtists(data.items || []);
      aggregateGenres(data.items || []);
    } catch (err) {
      setErrorArtists(err.message);
    } finally {
      setLoadingArtists(false);
    }
  }, [token]);

  const aggregateGenres = (artists) => {
    const counts = {};
    artists.forEach((artist) => {
      (artist.genres || []).forEach((g) => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, percent: Math.round((count / total) * 100) }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 10);
    setGenres(sorted);
  };

  useEffect(() => {
    fetchTopTracks(tracksRange);
  }, [tracksRange, fetchTopTracks]);

  useEffect(() => {
    fetchTopArtists(artistsRange);
  }, [artistsRange, fetchTopArtists]);

  return (
    <div className={styles.container}>
      {/* Top Tracks */}
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitle}>{'///TOP TRACKS'}</h4>
      </div>
      <div className={styles.tabs}>
        {TIME_RANGES.map((r) => (
          <button
            key={r.key}
            className={`${styles.tab} ${tracksRange === r.key ? styles.tabActive : ''}`}
            onClick={() => setTracksRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {loadingTracks && <p className={styles.loading}>Loading...</p>}
      {errorTracks && <p className={styles.error}>{errorTracks}</p>}
      {!loadingTracks && !errorTracks && (
        <div className={styles.list}>
          {topTracks.map((track, i) => (
            <div className={styles.listItem} key={track.id}>
              <span className={styles.rank}>{i + 1}</span>
              {track.album && track.album.images && track.album.images.length > 0 && (
                <img
                  className={styles.itemImage}
                  src={track.album.images[track.album.images.length - 1].url}
                  alt={track.name}
                />
              )}
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{track.name}</p>
                <p className={styles.itemSub}>
                  {track.artists && track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Artists */}
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitle}>{'///TOP ARTISTS'}</h4>
      </div>
      <div className={styles.tabs}>
        {TIME_RANGES.map((r) => (
          <button
            key={r.key}
            className={`${styles.tab} ${artistsRange === r.key ? styles.tabActive : ''}`}
            onClick={() => setArtistsRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {loadingArtists && <p className={styles.loading}>Loading...</p>}
      {errorArtists && <p className={styles.error}>{errorArtists}</p>}
      {!loadingArtists && !errorArtists && (
        <div className={styles.list}>
          {topArtists.map((artist, i) => (
            <div className={styles.listItem} key={artist.id}>
              <span className={styles.rank}>{i + 1}</span>
              {artist.images && artist.images.length > 0 && (
                <img
                  className={styles.itemImageRound}
                  src={artist.images[artist.images.length - 1].url}
                  alt={artist.name}
                />
              )}
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{artist.name}</p>
                <p className={styles.itemSub}>
                  {artist.genres && artist.genres.slice(0, 3).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Genres */}
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitle}>{'///TOP GENRES'}</h4>
      </div>
      {genres.length > 0 ? (
        <div className={styles.genreList}>
          {genres.map((genre) => (
            <div className={styles.genreItem} key={genre.name}>
              <div className={styles.genreLabel}>
                <span className={styles.genreName}>{genre.name}</span>
                <span className={styles.genrePercent}>{genre.percent}%</span>
              </div>
              <div className={styles.genreBarBg}>
                <div
                  className={styles.genreBar}
                  style={{ width: `${genre.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loadingArtists && <p className={styles.loading}>No genre data available</p>
      )}
    </div>
  );
};

export default Stats;
