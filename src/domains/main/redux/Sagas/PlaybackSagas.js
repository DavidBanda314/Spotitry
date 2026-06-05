import { all, takeLatest, call, put, select, delay } from 'redux-saga/effects';
import * as Actions from '../Actions/PlaybackActions'
import { setDatabaseUserSucceeded } from '../Actions/UserActions'
import axios from 'axios'
import { PLAYER_ENDPOINT } from '../../../../utils/constants'
import { saveTimestamp, fetchUser } from '../../../../firebase'

export function* getPlaybackInfo({ token, createTimestamp, userId, note}) {
    try {
        const playbackInfo = yield call(axios.get, PLAYER_ENDPOINT,
            {
                headers: {
                'Authorization': 'Bearer ' + token
                }
            })
        const availableDevices = yield call(axios.get, `${PLAYER_ENDPOINT}/devices`,
            {
                headers: {
                'Authorization': 'Bearer ' + token
            }
            })
        if(availableDevices){
            const playback = playbackInfo.data
            const devices = availableDevices.data
            yield put(Actions.getPlaybackInfoSucceeded(playback,devices))
            if(createTimestamp === 1){
                yield call(saveTimestamp, userId, playback.item, playback.progress_ms, note)
                const user = yield call(fetchUser, userId)
                if(user){
                    yield put(setDatabaseUserSucceeded(user))
                }
            }
        }
        else{
            yield put(Actions.getPlaybackInfoFailed('Unable to get data'))
        }
    }
    catch(error){
        yield put(Actions.getPlaybackInfoFailed(error))
    }
}

export function* playSong({token, position_ms, songURI, song}){
    try{
        // Wait briefly for the in-app Web Playback device to register so we can
        // target it directly. Targeting the device lets a single play request
        // start at position_ms, instead of starting at 0 and seeking after.
        let deviceId = yield select(state => state.Player.deviceId)
        for (let i = 0; i < 10 && !deviceId; i++) {
            yield delay(300)
            deviceId = yield select(state => state.Player.deviceId)
        }
        const url = deviceId
            ? `${PLAYER_ENDPOINT}/play?device_id=${deviceId}`
            : `${PLAYER_ENDPOINT}/play`
        yield call(axios.put, url, {uris: [songURI], position_ms: position_ms}, {headers:{'Authorization': 'Bearer ' + token}})
        yield put(Actions.playSongSucceeded())
        yield put(Actions.setPlaybackInfo(song))
    }
    catch(error){
        console.log(error)
    }
}

export function* getRecentlyPlayed({token}) {
    try {
        const response =  yield call(axios.get,`${PLAYER_ENDPOINT}/recently-played`,
            { headers: {'Authorization': 'Bearer ' + token }})
        if(response) {
            const recentlyPlayed = response.data.items
            yield put(Actions.getRecentlyPlayedSucceeded(recentlyPlayed))
        }
        else {
            yield put(Actions.getRecentlyPlayedFailed('Could not get recently played'))
        }
    
    }
    catch(error) {
        yield put(Actions.getRecentlyPlayedFailed(error))
    }

}

function* playbackSaga() {
    yield all([
        yield takeLatest(Actions.playbackActions.getPlaybackInfoRequested, getPlaybackInfo),
        yield takeLatest(Actions.playbackActions.playSongRequested, playSong),
        yield takeLatest(Actions.playbackActions.getRecentlyPlayedRequested, getRecentlyPlayed)
    ]);
}
export default playbackSaga
