import React from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import emptyProfile from '../../../images/empty_profile.jpeg'

const Account = (props) => {
    const { profile, databaseUser, topArtists } = props

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('expiration')
        localStorage.removeItem('refresh_token')
        window.location.href = '/'
    }

    const followersCount = profile?.followers?.total ?? 0
    const savedCount = Object.values(databaseUser?.timestamps ?? {}).reduce(
        (total, songGroup) => total + Object.keys(songGroup ?? {}).length,
        0
    )
    const topArtistsCount = topArtists?.length ?? 0

    return(
        <div className={styles.header}>
            <div className={styles.banner}>
                <div className={styles.row}>
                    <img className={styles.profilePic} alt="Profile" src={Object.keys(profile).length ? profile?.images[0]?.url : emptyProfile} ></img>
                    { Object.keys(profile).length ?
                    <div>
                        <div className={styles.name} >{`${profile?.display_name}`}</div>
                        <div className={styles.email}>{profile?.email}</div>
                        <div className={styles.followers}>{profile.followers.total} Followers</div>
                    </div>
                    :
                    <div>
                        <div className={styles.name} >{"Loading..."}</div>
                        <div className={styles.email}>{"Loading..."}</div>
                        <div className={styles.followers}>{"Loading..."}</div>
                    </div>
                    }
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>{followersCount}</div>
                            <div className={styles.statLabel}>Followers</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>{savedCount}</div>
                            <div className={styles.statLabel}>Saved</div>
                        </div>
                        <div className={styles.stat}>
                            <div className={styles.statNumber}>{topArtistsCount}</div>
                            <div className={styles.statLabel}>Top Artists</div>
                        </div>
                    </div>
                </div>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </div>

    )
}

const mapStateToProps = (state) => {
    return {
        profile: state?.User?.profile,
        databaseUser: state?.User?.databaseUser,
        topArtists: state?.User?.topArtists
    }
}

export default connect(mapStateToProps,null)(Account);
