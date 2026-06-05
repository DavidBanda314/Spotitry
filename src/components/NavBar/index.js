import React from 'react'
import styles from './index.module.css'
import { useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faHistory, faBookmark, faSearch, faUser, faChartBar, faPlus } from '@fortawesome/free-solid-svg-icons'
import { getPlaybackInfoRequested } from '../../domains/main/redux/Actions/PlaybackActions.js'

const tabs = [
    { path: 'home', label: 'Home', icon: faHome },
    { path: 'history', label: 'History', icon: faHistory },
    { path: 'discover', label: 'Discover', icon: faSearch },
    { path: 'timestamps', label: 'Saved', icon: faBookmark },
    { path: 'stats', label: 'Stats', icon: faChartBar },
    { path: 'account', label: 'Profile', icon: faUser },
]

const NavBar = (props) => {
    const { token, userId, selectedSong, getPlaybackInfo } = props
    const history = useHistory()
    const location = useLocation()
    const current = location.pathname.replace('/', '').toLowerCase()

    const canSave = !!(token && userId && selectedSong?.songURI)
    const handleCreate = () => {
        if (canSave) {
            getPlaybackInfo(token, 1, userId)
        }
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
        <nav className={styles.nav}>
            {tabs.slice(0, mid).map(renderTab)}
            <div className={styles.centerSlot}>
                <button
                    type="button"
                    className={styles.centerButton}
                    onClick={handleCreate}
                    disabled={!canSave}
                    aria-label="Save a timestamp of the current song"
                    title={canSave ? 'Save a timestamp of the current song' : 'Play a song to save a timestamp'}
                >
                    <FontAwesomeIcon icon={faPlus} className={styles.centerIcon} />
                </button>
            </div>
            {tabs.slice(mid).map(renderTab)}
        </nav>
    )
}

const mapStateToProps = (state) => {
    return {
        token: state.User.token,
        userId: state.User.databaseUser.userId,
        selectedSong: state.Player.selectedSong,
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        getPlaybackInfo: (token, create, userId) => dispatch(getPlaybackInfoRequested(token, create, userId)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
