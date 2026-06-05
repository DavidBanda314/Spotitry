import React from 'react'
import styles from './index.module.css'
import { useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faHistory, faBookmark, faSearch, faUser } from '@fortawesome/free-solid-svg-icons'

const tabs = [
    { path: 'home', label: 'Home', icon: faHome },
    { path: 'history', label: 'History', icon: faHistory },
    { path: 'discover', label: 'Discover', icon: faSearch },
    { path: 'timestamps', label: 'Saved', icon: faBookmark },
    { path: 'account', label: 'Profile', icon: faUser },
]

const NavBar = () => {
    const history = useHistory()
    const location = useLocation()
    const current = location.pathname.replace('/', '').toLowerCase()

    return (
        <nav className={styles.nav}>
            {tabs.map((tab) => {
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
            })}
        </nav>
    )
}

export default NavBar;
