import React, { useState, useRef } from 'react'
import styles from './index.module.css'

const CreatePlaylistModal = ({ isOpen, onClose, defaultName, token, userId, trackUris }) => {
    const [playlistName, setPlaylistName] = useState(defaultName)
    const [isPublic, setIsPublic] = useState(false)
    const [status, setStatus] = useState('idle') // idle | loading | success | error
    const [playlistUrl, setPlaylistUrl] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const abortRef = useRef(null)

    const handleCreate = async () => {
        if (!playlistName.trim()) return
        setStatus('loading')

        const controller = new AbortController()
        abortRef.current = controller
        const signal = controller.signal

        try {
            const headers = {
                Authorization: 'Bearer ' + token,
                'Content-Type': 'application/json',
            }

            const createRes = await fetch(
                `https://api.spotify.com/v1/users/${userId}/playlists`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        name: playlistName,
                        public: isPublic,
                        description: 'Created with Spotitry',
                    }),
                    signal,
                }
            )

            if (!createRes.ok) {
                throw new Error('Failed to create playlist')
            }

            const playlist = await createRes.json()

            // Spotify allows max 100 URIs per request
            for (let i = 0; i < trackUris.length; i += 100) {
                const batch = trackUris.slice(i, i + 100)
                const addRes = await fetch(
                    `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                    {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ uris: batch }),
                        signal,
                    }
                )
                if (!addRes.ok) {
                    throw new Error('Failed to add tracks to playlist')
                }
            }

            setPlaylistUrl(playlist.external_urls.spotify)
            setStatus('success')
        } catch (err) {
            if (err.name === 'AbortError') return
            setErrorMessage(err.message || 'Something went wrong')
            setStatus('error')
        }
    }

    const handleClose = () => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        setStatus('idle')
        setPlaylistName(defaultName)
        setIsPublic(false)
        setPlaylistUrl('')
        setErrorMessage('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {status === 'success' ? (
                    <>
                        <h3 className={styles.title}>Playlist Created!</h3>
                        <p className={styles.subtitle}>
                            Your playlist &quot;{playlistName}&quot; has been created with{' '}
                            {trackUris.length} track{trackUris.length !== 1 ? 's' : ''}.
                        </p>
                        <a
                            href={playlistUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.spotifyLink}
                        >
                            Open in Spotify
                        </a>
                        <button className={styles.closeBtn} onClick={handleClose}>
                            Done
                        </button>
                    </>
                ) : status === 'error' ? (
                    <>
                        <h3 className={styles.title}>Error</h3>
                        <p className={styles.errorText}>{errorMessage}</p>
                        <button className={styles.createBtn} onClick={() => setStatus('idle')}>
                            Try Again
                        </button>
                        <button className={styles.closeBtn} onClick={handleClose}>
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <h3 className={styles.title}>Create Playlist</h3>
                        <p className={styles.subtitle}>
                            {trackUris.length} unique track{trackUris.length !== 1 ? 's' : ''} will
                            be added.
                        </p>
                        <label className={styles.label}>Playlist Name</label>
                        <input
                            className={styles.input}
                            type="text"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                        />
                        <div className={styles.toggleRow}>
                            <span className={styles.toggleLabel}>Public</span>
                            <button
                                type="button"
                                className={`${styles.toggle} ${isPublic ? styles.toggleOn : ''}`}
                                onClick={() => setIsPublic(!isPublic)}
                                aria-label="Toggle public"
                            >
                                <span className={styles.toggleKnob} />
                            </button>
                        </div>
                        <button
                            className={styles.createBtn}
                            onClick={handleCreate}
                            disabled={status === 'loading' || !playlistName.trim()}
                        >
                            {status === 'loading' ? 'Creating...' : 'Create Playlist'}
                        </button>
                        <button className={styles.closeBtn} onClick={handleClose}>
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default CreatePlaylistModal
