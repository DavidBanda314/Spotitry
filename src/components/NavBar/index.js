import React from 'react'
import styles from './index.module.css'
import { useHistory, useLocation } from 'react-router-dom';

const tabs = [
    { path: 'home', label: 'Home' },
    { path: 'history', label: 'History' },
    { path: 'discover', label: 'Discover' },
    { path: 'timestamps', label: 'Saved' },
    { path: 'account', label: 'Profile' },
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
                        <span className={styles.label}>{tab.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}

export default NavBar;
