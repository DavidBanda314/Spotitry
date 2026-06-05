import React, { useRef } from 'react'
import styles from './index.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'

const SearchBar = (props) => {
    const { value, onChange, onClear, onSubmit, placeholder = 'Search for a song' } = props
    const inputRef = useRef(null)

    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            onSubmit?.(value)
        } else if (event.key === 'Escape') {
            onClear?.()
            inputRef.current?.focus()
        }
    }

    return (
        <div className={styles.SearchBar}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
                ref={inputRef}
                className={styles.input}
                type="text"
                value={value}
                placeholder={placeholder}
                aria-label="Search for a song"
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={onKeyDown}
            />
            {value && (
                <button
                    type="button"
                    className={styles.clearButton}
                    aria-label="Clear search"
                    onClick={() => {
                        onClear?.()
                        inputRef.current?.focus()
                    }}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            )}
        </div>
    )
}

export default SearchBar;
