import React, { useState, useRef, useEffect } from 'react'
import styles from './index.module.css'
import { useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faHistory, faBookmark, faSearch, faUser, faChartBar, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import { getPlaybackInfoRequested } from '../../domains/main/redux/Actions/PlaybackActions.js'
import { updateTimestampNote } from '../../firebase'

const tabs = [
    { path: 'home', label: 'Home', icon: faHome },
    { path: 'history', label: 'History', icon: faHistory },
    { path: 'discover', label: 'Discover', icon: faSearch },
    { path: 'timestamps', label: 'Saved', icon: faBookmark },
    { path: 'stats', label: 'Stats', icon: faChartBar },
    { path: 'account', label: 'Profile', icon: faUser },
]

const NavBar = (props) => {
    const { token, userId, selectedSong, getPlaybackInfo, lastCreatedTimestamp } = props
    const history = useHistory()
    const location = useLocation()
    const current = location.pathname.replace('/', '').toLowerCase()

    const [saved, setSaved] = useState(false)
    const [showNote, setShowNote] = useState(false)
    const [noteText, setNoteText] = useState('')
    const pendingNoteRef = useRef(null)
    const savedTimer = useRef(null)
    const noteInputRef = useRef(null)
    useEffect(() => () => clearTimeout(savedTimer.current), [])

    // When lastCreatedTimestamp arrives and we have a queued note, flush it
    useEffect(() => {
        if (lastCreatedTimestamp && pendingNoteRef.current) {
            const note = pendingNoteRef.current
            pendingNoteRef.current = null
            updateTimestampNote(userId, lastCreatedTimestamp.songKey, lastCreatedTimestamp.pushId, note)
        }
    }, [lastCreatedTimestamp, userId])

    const canSave = !!(token && userId && selectedSong?.songURI)
    const handleCreate = () => {
        if (canSave && !showNote) {
            getPlaybackInfo(token, 1, userId)
            setSaved(true)
            clearTimeout(savedTimer.current)
            savedTimer.current = setTimeout(() => setSaved(false), 2000)
            setShowNote(true)
            setTimeout(() => { if (noteInputRef.current) noteInputRef.current.focus() }, 50)
        }
    }

    const saveWithNote = async () => {
        if (noteText.trim()) {
            if (lastCreatedTimestamp) {
                await updateTimestampNote(userId, lastCreatedTimestamp.songKey, lastCreatedTimestamp.pushId, noteText)
            } else {
                pendingNoteRef.current = noteText
            }
        }
        setShowNote(false)
        setNoteText('')
    }

    const cancelNote = () => {
        setShowNote(false)
        setNoteText('')
    }

    const renderTab = (tab) => {
        const active = current === tab.path
        return (
            <button
                key={tab.path}
                type="button"
                className={`${styles.item} ${active ? styles.active : ''}`}
                onClick={() => history.push(`/${tab.path}`)}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
            >
                <FontAwesomeIcon icon={tab.icon} className={styles.icon} />
                <span className={styles.label}>{tab.label}</span>
            </button>
        )
    }

    const mid = Math.ceil(tabs.length / 2)

    return (
        <>
        {showNote && (
            <div className={styles.noteOverlay} onClick={cancelNote}>
                <div className={styles.noteBar} onClick={(e) => e.stopPropagation()}>
                    <input
                        ref={noteInputRef}
                        type="text"
                        className={styles.noteInput}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveWithNote(); if (e.key === 'Escape') cancelNote(); }}
                        placeholder="Add a note (optional)..."
                    />
                    <button type="button" className={styles.noteSaveBtn} onClick={saveWithNote}>Save</button>
                    <button type="button" className={styles.noteCancelBtn} onClick={cancelNote}>Skip</button>
                </div>
            </div>
        )}
        <nav className={styles.nav}>
            {tabs.slice(0, mid).map(renderTab)}
            {canSave && (
                <div className={styles.centerSlot}>
                    <button
                        type="button"
                        className={`${styles.centerButton} ${saved ? styles.centerButtonSaved : ''}`}
                        onClick={handleCreate}
                        aria-label={saved ? 'Timestamp saved' : 'Save a timestamp of the current song'}
                        title="Save a timestamp of the current song"
                    >
                        <FontAwesomeIcon icon={saved ? faCheck : faPlus} className={styles.centerIcon} />
                    </button>
                </div>
            )}
            {tabs.slice(mid).map(renderTab)}
        </nav>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        token: state.User.token,
        userId: state.User.databaseUser.userId,
        selectedSong: state.Player.selectedSong,
        lastCreatedTimestamp: state.Player.lastCreatedTimestamp,
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        getPlaybackInfo: (token, create, userId, note) => dispatch(getPlaybackInfoRequested(token, create, userId, note)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
