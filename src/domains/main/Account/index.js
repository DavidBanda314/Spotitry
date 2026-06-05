import React from 'react'
import styles from './index.module.css'
import { connect } from 'react-redux'
import emptyProfile from '../../../images/empty_profile.jpeg'

const Account = (props) => {
    const { profile } = props
    console.log(profile)
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
                </div>
            </div>
        </div>

    )
}

const mapStateToProps = (state) => {
    return {
        profile: state?.User?.profile
    }
}

export default connect(mapStateToProps,null)(Account);
