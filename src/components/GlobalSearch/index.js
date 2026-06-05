import React from 'react'
import { useHistory } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import styles from './index.module.css'

const GlobalSearch = () => {
    const history = useHistory()
    return (
        <button
            type="button"
            className={styles.searchPill}
            onClick={() => history.push('/search')}
            aria-label="Search"
        >
            <FontAwesomeIcon icon={faSearch} className={styles.icon} />
            <span className={styles.label}>Search</span>
        </button>
    )
}

export default GlobalSearch
