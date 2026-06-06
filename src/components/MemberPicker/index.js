import React, { useEffect, useState, useCallback, useRef } from 'react'
import styles from './index.module.css'
import {
    getArtistMembers as fbGetArtistMembers,
    addArtistMember as fbAddArtistMember,
    updateArtistMember as fbUpdateArtistMember,
    deleteArtistMember as fbDeleteArtistMember,
} from '../../firebase'

// A small fixed palette so members get distinct, readable chip colors.
const PALETTE = [
    '#ff5da2', '#5db1ff', '#7bd88f', '#ffd166',
    '#c792ea', '#ff8b5d', '#4dd0e1', '#f06292',
]

function rosterToList(roster) {
    if (!roster || !roster.members) return []
    return Object.entries(roster.members).map(function (entry) {
        return { memberId: entry[0], name: entry[1].name || '', color: entry[1].color || '' }
    })
}

// Renders the current member chip and, on click, a dropdown to assign a
// member or manage the band's roster (add / rename / recolor / delete).
const MemberPicker = (props) => {
    const { userId, artistId, artistName, value, onChange } = props

    const [members, setMembers] = useState([])
    const [open, setOpen] = useState(false)
    const [manage, setManage] = useState(false)
    const [draftName, setDraftName] = useState('')
    const [draftColor, setDraftColor] = useState(PALETTE[0])
    const [editingId, setEditingId] = useState(null)
    const wrapRef = useRef(null)

    const canUse = Boolean(userId && artistId)

    const loadMembers = useCallback(async () => {
        if (!canUse) return
        const roster = await fbGetArtistMembers(userId, artistId)
        setMembers(rosterToList(roster))
    }, [userId, artistId, canUse])

    useEffect(() => {
        loadMembers()
    }, [loadMembers])

    // Close the dropdown when clicking outside it.
    useEffect(() => {
        if (!open) return undefined
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false)
                setManage(false)
                setEditingId(null)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const handleAssign = (member) => {
        if (onChange) onChange(member)
        setOpen(false)
    }

    const handleClear = () => {
        if (onChange) onChange(null)
        setOpen(false)
    }

    const resetDraft = () => {
        setDraftName('')
        setDraftColor(PALETTE[members.length % PALETTE.length])
        setEditingId(null)
    }

    const handleAddOrUpdate = async () => {
        const name = draftName.trim()
        if (!name || !canUse) return
        if (editingId) {
            await fbUpdateArtistMember(userId, artistId, editingId, { name, color: draftColor })
            // If the currently selected member was edited, propagate the change.
            if (value && value.memberId === editingId && onChange) {
                onChange({ memberId: editingId, name, color: draftColor })
            }
        } else {
            await fbAddArtistMember(userId, artistId, { name, color: draftColor }, artistName)
        }
        resetDraft()
        await loadMembers()
    }

    const handleEditMember = (member) => {
        setEditingId(member.memberId)
        setDraftName(member.name)
        setDraftColor(member.color || PALETTE[0])
    }

    const handleDeleteMember = async (member) => {
        if (!canUse) return
        await fbDeleteArtistMember(userId, artistId, member.memberId)
        if (value && value.memberId === member.memberId) handleClear()
        if (editingId === member.memberId) resetDraft()
        await loadMembers()
    }

    return (
        <div className={styles.wrap} ref={wrapRef}>
            {value && value.memberId ? (
                <button
                    type="button"
                    className={styles.chip}
                    style={{ backgroundColor: value.memberColor || '#888' }}
                    onClick={() => setOpen(!open)}
                    title="Change member"
                >
                    {value.memberName || 'Member'}
                </button>
            ) : (
                <button
                    type="button"
                    className={styles.addChip}
                    onClick={() => setOpen(!open)}
                    title="Label which member sings this"
                    disabled={!canUse}
                >
                    + Member
                </button>
            )}

            {open && (
                <div className={styles.dropdown}>
                    {!manage ? (
                        <>
                            {members.length === 0 ? (
                                <span className={styles.empty}>No members yet</span>
                            ) : (
                                members.map(function (m) {
                                    return (
                                        <button
                                            key={m.memberId}
                                            type="button"
                                            className={styles.option}
                                            onClick={() => handleAssign(m)}
                                        >
                                            <span className={styles.swatch} style={{ backgroundColor: m.color || '#888' }} />
                                            {m.name}
                                        </button>
                                    )
                                })
                            )}
                            {value && value.memberId && (
                                <button type="button" className={styles.clear} onClick={handleClear}>
                                    Clear label
                                </button>
                            )}
                            <button
                                type="button"
                                className={styles.manageLink}
                                onClick={() => { setManage(true); resetDraft() }}
                            >
                                Manage members
                            </button>
                        </>
                    ) : (
                        <div className={styles.manage}>
                            <div className={styles.manageTitle}>{artistName || 'Band'} members</div>
                            {members.map(function (m) {
                                return (
                                    <div key={m.memberId} className={styles.manageRow}>
                                        <span className={styles.swatch} style={{ backgroundColor: m.color || '#888' }} />
                                        <span className={styles.manageName}>{m.name}</span>
                                        <button type="button" className={styles.miniBtn} onClick={() => handleEditMember(m)}>Edit</button>
                                        <button type="button" className={styles.miniBtn} onClick={() => handleDeleteMember(m)}>Delete</button>
                                    </div>
                                )
                            })}
                            <div className={styles.editor}>
                                <input
                                    className={styles.nameInput}
                                    value={draftName}
                                    placeholder="Member name"
                                    onChange={(e) => setDraftName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddOrUpdate() }}
                                />
                                <div className={styles.palette}>
                                    {PALETTE.map(function (c) {
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                className={c === draftColor ? styles.swatchSelected : styles.swatchPick}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setDraftColor(c)}
                                                aria-label={'Color ' + c}
                                            />
                                        )
                                    })}
                                </div>
                                <div className={styles.editorActions}>
                                    <button type="button" className={styles.saveBtn} onClick={handleAddOrUpdate}>
                                        {editingId ? 'Save' : 'Add'}
                                    </button>
                                    <button type="button" className={styles.backBtn} onClick={() => { setManage(false); resetDraft() }}>
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default MemberPicker
