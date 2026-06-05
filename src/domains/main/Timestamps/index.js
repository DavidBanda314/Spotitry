import React, { useEffect, useState, useMemo, useCallback } from 'react'
import styles from '../Timestamps/index.module.css'
import { connect } from 'react-redux'
import { getProfileRequested } from '../redux/Actions/UserActions'
import { playSongRequested, setSelectedSong } from '../redux/Actions/PlaybackActions'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faListUl, faLink, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import CreatePlaylistModal from '../../../components/CreatePlaylistModal'
import { SkeletonGrid } from '../../../components/Skeleton'
import {
    createCollection as fbCreateCollection,
    addTimestampToCollection as fbAddTimestampToCollection,
    removeTimestampFromCollection as fbRemoveTimestampFromCollection,
    deleteCollection as fbDeleteCollection,
    fetchCollections as fbFetchCollections,
} from '../../../firebase'


const Timestamps = (props) => {
    const {token, timestamps, playSong, setSelectedSong, selectedSong, userId, databaseUserLoaded} = props
    const [timestampsBySong,setTimeStampsBySong] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [allTimeStampsBySong,setAllTimeStampsBySong] = useState([])
    const [showPlaylistModal, setShowPlaylistModal] = useState(false)
    const [copiedId, setCopiedId] = useState(null)

    // Collections state
    const [collections, setCollections] = useState({})
    const [activeCollection, setActiveCollection] = useState(null)
    const [showNewCollInput, setShowNewCollInput] = useState(false)
    const [newCollName, setNewCollName] = useState('')
    const [collectionDropdownId, setCollectionDropdownId] = useState(null)
    const [addedConfirmId, setAddedConfirmId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    const handleShare = async (song, positionMs, note, id) => {
        const baseUrl = window.location.origin
        const params = new URLSearchParams({ track: song?.uri || '', t: positionMs })
        if (note) params.set('note', note)
        if (song?.name) params.set('s', song.name)
        const artist = song?.artists?.map((a) => a.name).join(', ')
        if (artist) params.set('a', artist)
        if (song?.album?.name) params.set('al', song.album.name)
        const img = song?.album?.images?.[0]?.url
        if (img) params.set('img', img)
        if (song?.preview_url) params.set('p', song.preview_url)
        if (song?.duration_ms) params.set('d', song.duration_ms)
        const url = `${baseUrl}/share?${params.toString()}`

        const shareData = {
            title: `${song?.name || 'A moment'} on Spotitry`,
            text: note ? `"${note}"` : `Listen from ${millisToMinutesAndSeconds(positionMs)}`,
            url,
        }
        if (navigator.share) {
            try {
                await navigator.share(shareData)
                return
            } catch (err) {
                // user dismissed the share sheet, or it is unsupported – fall back to copy
                if (err && err.name === 'AbortError') return
            }
        }
        try {
            await navigator.clipboard.writeText(url)
            setCopiedId(id)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            // clipboard unavailable; nothing else to do
        }
    }

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

    // Fetch collections on mount
    useEffect(() => {
        if (userId) {
            fbFetchCollections(userId).then(function (data) {
                setCollections(data || {})
            })
        }
    }, [userId])

    // Process raw timestamps into allTimeStampsBySong with keys preserved
    useEffect(() => {
        if (timestamps) {
            var tempArr2 = []
            Object.entries(timestamps).forEach(function (entry) {
                var songKey = entry[0]
                var songGroup = entry[1]
                var items = Object.entries(songGroup).map(function (inner) {
                    var pushId = inner[0]
                    var ts = inner[1]
                    return Object.assign({}, ts, { _songKey: songKey, _pushId: pushId })
                })
                tempArr2.push(items)
            })
            setAllTimeStampsBySong(tempArr2)
        } else {
            setAllTimeStampsBySong([])
        }
    }, [timestamps])

    // Apply search + collection filters
    useEffect(() => {
        var filtered = allTimeStampsBySong

        if (searchValue) {
            filtered = filtered.filter(function (group) {
                var name = group[0] && group[0].song && group[0].song.name
                return name && name.toLowerCase().includes(searchValue.toLowerCase())
            })
        }

        if (activeCollection && collections[activeCollection]) {
            var collTs = collections[activeCollection].timestamps || {}
            var keys = new Set()
            Object.values(collTs).forEach(function (t) {
                keys.add(t.songName + '|' + t.timestampKey)
            })
            filtered = filtered
                .map(function (group) {
                    return group.filter(function (ts) {
                        return keys.has(ts._songKey + '|' + ts._pushId)
                    })
                })
                .filter(function (group) { return group.length > 0 })
        }

        setTimeStampsBySong(filtered)
    }, [allTimeStampsBySong, searchValue, activeCollection, collections])

    // Collection handlers
    const handleCreateCollection = useCallback(async function () {
        if (!newCollName.trim() || !userId) return
        var key = await fbCreateCollection(userId, newCollName.trim())
        if (key) {
            setCollections(function (prev) {
                var next = Object.assign({}, prev)
                next[key] = { name: newCollName.trim() }
                return next
            })
            setNewCollName('')
            setShowNewCollInput(false)
        }
    }, [newCollName, userId])

    const handleDeleteCollection = useCallback(async function () {
        if (!activeCollection || !userId) return
        await fbDeleteCollection(userId, activeCollection)
        setCollections(function (prev) {
            var next = Object.assign({}, prev)
            delete next[activeCollection]
            return next
        })
        setActiveCollection(null)
        setDeleteConfirm(false)
    }, [activeCollection, userId])

    const handleAddToCollection = useCallback(async function (collectionId, timestamp) {
        if (!userId) return
        var data = {
            songName: timestamp._songKey,
            timestampKey: timestamp._pushId,
            position_ms: timestamp.position_ms,
            song: timestamp.song,
        }
        if (timestamp.note) { data.note = timestamp.note }
        await fbAddTimestampToCollection(userId, collectionId, data)
        var updated = await fbFetchCollections(userId)
        setCollections(updated || {})
        var confirmKey = collectionDropdownId
        setCollectionDropdownId(null)
        setAddedConfirmId(confirmKey)
        setTimeout(function () { setAddedConfirmId(null) }, 1500)
    }, [userId, collectionDropdownId])

    const handleRemoveFromCollection = useCallback(async function (timestamp) {
        if (!userId || !activeCollection) return
        var collTs = collections[activeCollection]?.timestamps || {}
        var matchKey = null
        Object.entries(collTs).forEach(function (entry) {
            if (entry[1].songName === timestamp._songKey && entry[1].timestampKey === timestamp._pushId) {
                matchKey = entry[0]
            }
        })
        if (matchKey) {
            await fbRemoveTimestampFromCollection(userId, activeCollection, matchKey)
            var updated = await fbFetchCollections(userId)
            setCollections(updated || {})
        }
    }, [userId, activeCollection, collections])

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

            {/* Collections */}
            <div className={styles.collectionsSection}>
                <div className={styles.collectionsRow}>
                    <button
                        className={!activeCollection ? styles.chipActive : styles.chip}
                        onClick={() => { setActiveCollection(null); setDeleteConfirm(false) }}
                    >
                        All
                    </button>
                    {Object.entries(collections).map(function (entry) {
                        var id = entry[0]
                        var col = entry[1]
                        return (
                            <button
                                className={activeCollection === id ? styles.chipActive : styles.chip}
                                key={id}
                                onClick={() => { setActiveCollection(activeCollection === id ? null : id); setDeleteConfirm(false) }}
                            >
                                {col.name}
                            </button>
                        )
                    })}
                    {showNewCollInput ? (
                        <span className={styles.newCollInputWrap}>
                            <input
                                className={styles.newCollInput}
                                value={newCollName}
                                onChange={(e) => setNewCollName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateCollection()
                                    if (e.key === 'Escape') { setShowNewCollInput(false); setNewCollName('') }
                                }}
                                placeholder="Collection name..."
                                autoFocus
                            />
                            <button className={styles.newCollSaveBtn} onClick={handleCreateCollection}>Create</button>
                            <button className={styles.newCollCancelBtn} onClick={() => { setShowNewCollInput(false); setNewCollName('') }}>{'×'}</button>
                        </span>
                    ) : (
                        <button className={styles.newCollBtn} onClick={() => setShowNewCollInput(true)}>+ New Collection</button>
                    )}
                </div>
            </div>

            {/* Collection header when active */}
            {activeCollection && collections[activeCollection] && (
                <div className={styles.collectionHeader}>
                    <span className={styles.collectionName}>{collections[activeCollection].name}</span>
                    {!deleteConfirm ? (
                        <button className={styles.deleteCollBtn} onClick={() => setDeleteConfirm(true)}>Delete Collection</button>
                    ) : (
                        <span className={styles.deleteConfirmWrap}>
                            <span className={styles.deleteConfirmText}>Delete?</span>
                            <button className={styles.deleteConfirmYes} onClick={handleDeleteCollection}>Yes</button>
                            <button className={styles.deleteConfirmNo} onClick={() => setDeleteConfirm(false)}>No</button>
                        </span>
                    )}
                </div>
            )}

            <div className={styles.searchField}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="Search timestamps..."
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                />
            </div>
            {!databaseUserLoaded ? (
                <div className={styles.grid}>
                    <SkeletonGrid count={4} cardHeight="300px" />
                </div>
            ) : (!timestampsBySong || timestampsBySong.length === 0) ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>&#9834;</span>
                    {searchValue ? (
                        <>
                            <span className={styles.emptyTitle}>No timestamps match your search</span>
                            <span className={styles.emptySubtitle}>Try a different song name.</span>
                        </>
                    ) : activeCollection ? (
                        <>
                            <span className={styles.emptyTitle}>No timestamps in this collection</span>
                            <span className={styles.emptySubtitle}>Add timestamps using the + button on any timestamp.</span>
                        </>
                    ) : (
                        <>
                            <span className={styles.emptyTitle}>No saved timestamps yet</span>
                            <span className={styles.emptySubtitle}>Save a moment from a song and it will show up here.</span>
                        </>
                    )}
                </div>
            ) : (
            <div className={styles.grid}>
                    {timestampsBySong?.map((tsGroup, cardIndex) => {
                        var entries = Object.values(tsGroup)
                        var song = entries[0]?.song
                        var album = song?.album
                        var songName = song?.name
                        var albumCover = album?.images[0]?.url
                        var artistName = entries[0]?.song.artists[0]?.name ? entries[0].song.artists[0].name : entries[0].song.album.artists[0].name
                        return(
                            <div className={styles.card} key={cardIndex}>
                                <div className={styles.cardHeader}>
                                    {albumCover &&
                                        <img src={albumCover} alt="" className={styles.cover}/>
                                    }
                                    <div className={styles.cardMeta}>
                                        <span className={styles.songTitle}>{songName}</span>
                                        <span className={styles.artistName}>{artistName}</span>
                                        <span className={styles.albumName}>{album?.name}</span>
                                    </div>
                                </div>
                                <div className={styles.timestampList}>
                                    {entries.map((timestamp, tsIndex) => {
                                        var totalTime = song.duration_ms
                                        var timeSet = timestamp.position_ms
                                        var track = song
                                        var shareId = `${cardIndex}-${tsIndex}-${songName}`
                                        return(
                                            <div className={styles.timestampItem} key={tsIndex}>
                                                <div className={styles.timestampRow}>
                                                    <button
                                                        className={styles.timestampButton}
                                                        onClick={() => {
                                                            if(!selectedSong) {
                                                            }
                                                            else{
                                                                setSelectedSong(0,track?.uri,track);
                                                                playSong(token,timeSet,track?.uri,track)
                                                            }
                                                        }}
                                                    >
                                                        <span className={styles.playIcon}>&#9654;</span>
                                                        <span className={styles.timeLabel}>{millisToMinutesAndSeconds(timeSet)} / {millisToMinutesAndSeconds(totalTime)}</span>
                                                    </button>
                                                    <button
                                                        className={styles.shareBtn}
                                                        onClick={() => handleShare(track, timeSet, timestamp.note, shareId)}
                                                        title="Share this moment"
                                                    >
                                                        {copiedId === shareId ? '\u2713' : <FontAwesomeIcon icon={faLink} />}
                                                    </button>
                                                    {activeCollection && (
                                                        <button
                                                            className={styles.removeFromCollBtn}
                                                            onClick={() => handleRemoveFromCollection(timestamp)}
                                                            title="Remove from collection"
                                                        >
                                                            <FontAwesomeIcon icon={faMinus} />
                                                        </button>
                                                    )}
                                                    <div className={styles.addToCollWrap}>
                                                        <button
                                                            className={styles.addToCollBtn}
                                                            onClick={() => setCollectionDropdownId(collectionDropdownId === shareId ? null : shareId)}
                                                            title="Add to collection"
                                                        >
                                                            {addedConfirmId === shareId ? '\u2713' : <FontAwesomeIcon icon={faPlus} />}
                                                        </button>
                                                        {collectionDropdownId === shareId && (
                                                            <div className={styles.collDropdown}>
                                                                {Object.keys(collections).length === 0 ? (
                                                                    <span className={styles.collDropdownEmpty}>No collections yet</span>
                                                                ) : (
                                                                    Object.entries(collections).map(function (cEntry) {
                                                                        var cId = cEntry[0]
                                                                        var col = cEntry[1]
                                                                        return (
                                                                            <button
                                                                                key={cId}
                                                                                className={styles.collDropdownItem}
                                                                                onClick={() => handleAddToCollection(cId, timestamp)}
                                                                            >
                                                                                {col.name}
                                                                            </button>
                                                                        )
                                                                    })
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {timestamp.note && (
                                                    <span className={styles.note}>"{timestamp.note}"</span>
                                                )}
                                            </div>
                                        )
                                    })}
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
        refetchUser: (token) => dispatch(getProfileRequested(token)),
        setSelectedSong: (token, songURI, song) => dispatch(setSelectedSong(token, songURI, song))
    }
}
const mapStateToProps = (state) => {
    return {
        timestamps:state.User.databaseUser.timestamps,
        token:state.User.token,
        selectedSong: state.Player.selectedSong,
        userId: state.User.profile?.id,
        databaseUserLoaded: Object.keys(state.User.databaseUser).length > 0
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Timestamps);
