import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { searchSongsRequested } from '../redux/Actions/UserActions.js'
import { setSelectedSong } from '../redux/Actions/PlaybackActions.js'
import styles from './index.module.css'

const Search = (props) => {
    const { token, searchedSongs, searchSongs, setSelectedSong } = props
    const [query, setQuery] = useState('')

    useEffect(() => {
        const trimmed = query.trim()
        if (!trimmed) {
            return undefined
        }
        const handle = setTimeout(() => {
            searchSongs(token, trimmed)
        }, 300)
        return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    const selectSong = (song) => {
        setSelectedSong(song.track_number - 1, song.album.uri, song)
    }

    const hasQuery = query.trim().length > 0
    const results = hasQuery ? searchedSongs : []

    return (
        <div className={styles.container}>
            <div className={styles.searchField}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                    className={styles.input}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for songs and artists"
                    autoFocus
                />
            </div>

            <div className={styles.tabs}>
                <span className={`${styles.tab} ${styles.tabActive}`}>Songs</span>
            </div>

            {!hasQuery ? (
                <div className={styles.emptyState}>
                    <FontAwesomeIcon icon={faSearch} className={styles.emptyIcon} />
                    <span className={styles.emptyText}>Search for songs and artists</span>
                </div>
            ) : results.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyText}>No results</span>
                </div>
            ) : (
                <div className={styles.results}>
                    {results.map((song, key) => (
                        <div
                            className={styles.row}
                            key={song.id || key}
                            onClick={() => selectSong(song)}
                        >
                            <img
                                alt=""
                                src={song.album?.images?.[0]?.url}
                                className={styles.thumb}
                            />
                            <div className={styles.rowMeta}>
                                <span className={styles.rowTitle}>{song.name}</span>
                                <span className={styles.rowSubtitle}>{song.artists?.[0]?.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        searchSongs: (token, searchValue) => dispatch(searchSongsRequested(token, searchValue)),
        setSelectedSong: (position_ms, songURI, song) => dispatch(setSelectedSong(position_ms, songURI, song)),
    }
}

const mapStateToProps = (state) => {
    return {
        token: state.User.token,
        searchedSongs: state.User.searchedSongs,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
