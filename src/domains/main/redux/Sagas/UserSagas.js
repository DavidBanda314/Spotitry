import { all, takeLatest, call, put, select, take, race, delay } from 'redux-saga/effects';
import * as Actions from '../Actions/UserActions'
import axios from 'axios'
import { PROFILE_ENDPOINT, TOP_ARTISTS_ENDPOINT, TOP_TRACKS_ENDPOINT, SEARCH_ENDPOINT, RECOMMENDATIONS_ENDPOINT, NEW_RELEASES_ENDPOINT, parseSpecialCharacters, } from '../../../../utils/constants'
import {createAndFetchUser, fetchUser} from '../../../../firebase.js'
import { getRecentlyPlayedRequested } from '../../../main/redux/Actions/PlaybackActions'


export function* initializeUserData({token}){
    yield put (Actions.getTopArtistsRequested(token))
    yield put (Actions.getTopTracksRequested(token))
    yield put (Actions.getProfileRequested(token))
    yield put (getRecentlyPlayedRequested(token))
}

export function* getProfile({token}) {
    try {
        const response = yield call(axios.get,PROFILE_ENDPOINT,
            {
            headers: {
            'Authorization': 'Bearer ' + token
            }
          })
        
        if(response){
            yield put(Actions.getProfileSucceeded(response.data))
            yield put (Actions.setDatabaseUserRequested(response.data))
        }
        else {
            yield put (Actions.getProfileFailed('Could not get profile'))
        }

    }
    catch(error){
        yield put (Actions.getProfileFailed(error))
    }
}

//After Spotify authenticates, pull the data from firebase or create a new user
export function* setDatabaseUser({data}) {    
    const {email,id,display_name} = data

    try{
        const parsedId = parseSpecialCharacters(id)
        let user = yield fetchUser(parsedId)
        if(!user){
            yield call(createAndFetchUser(parsedId,display_name,email))
            user = {
                email:email,
                id:parsedId,
                display_name:display_name
            }
        }
        yield put(Actions.setDatabaseUserSucceeded(user))
        
    }
    catch(error){
        try{
            const {email,id,display_name} = data
            const parsedId = parseSpecialCharacters(id)
            const user = {
                email:email,
                userId:parsedId,
                display_name:display_name
            }
            yield call(createAndFetchUser(parsedId,display_name,email))
            yield put(Actions.setDatabaseUserSucceeded(user))

        }
        catch(error){
            yield put (Actions.setDatabaseUserFailed(error))
        }
    }

}

export function* getTopArtists({token}) {
    try {
        const response =  yield call(axios.get,TOP_ARTISTS_ENDPOINT,
            { headers: {'Authorization': 'Bearer ' + token }})

        if(response) {
            const topArtists = response.data.items
            yield put(Actions.getTopArtistsSucceeded(topArtists))
        }
        else {
            yield put(Actions.getTopArtistsFailed('Could not get top Artists'))
        }
    }
    catch(error) {
        yield put(Actions.getTopArtistsFailed(error))
    }

}

export function* getTopTracks({token}) {
    try {
        const response =  yield call(axios.get,TOP_TRACKS_ENDPOINT,
            { headers: {'Authorization': 'Bearer ' + token }})
        if(response) {
            const topTracks = response.data.items
            yield put(Actions.getTopTracksSucceeded(topTracks))
        }
        else {
            yield put(Actions.getTopTracksFailed('Could not get top tracks'))
        }
    
    }
    catch(error) {
        yield put(Actions.getTopTracksFailed(error))
    }

}

export function* searchSongs({token,searchValue = ''}) {
    try {
        var response = null
        if(searchValue){
        response =  yield call(axios.get, SEARCH_ENDPOINT,
        {headers: {'Authorization': 'Bearer ' + token},
            params: {
                'q':searchValue, 
                'type':'track,artist,album'
            },
        })
        }
        if(response) {
            const searchedSongs = response.data.tracks?.items || []
            const searchedArtists = response.data.artists?.items || []
            const searchedAlbums = response.data.albums?.items || []
            yield put(Actions.searchSongsSucceeded(searchedSongs, searchedArtists, searchedAlbums))
        }
        else {
            yield put(Actions.searchSongsFailed('Could not get search results'))
        }
    }
    catch(error) {
        yield put(Actions.searchSongsFailed(error))
    }
}

export function* getDiscoverFeed({token}) {
    try {
        let topTracks = yield select((state) => state.User.topTracks)
        let topArtists = yield select((state) => state.User.topArtists)

        // Top tracks/artists are fetched asynchronously at login; if they haven't
        // resolved yet, wait (bounded) so recommendations can be seeded properly.
        if (!(topTracks && topTracks.length) && !(topArtists && topArtists.length)) {
            yield race({
                done: all([
                    take([Actions.UserDataActions.GET_TOP_TRACKS_Succeeded, Actions.UserDataActions.GET_TOP_TRACKS_Failed]),
                    take([Actions.UserDataActions.GET_TOP_ARTISTS_Succeeded, Actions.UserDataActions.GET_TOP_ARTISTS_Failed]),
                ]),
                timeout: delay(5000),
            })
            topTracks = yield select((state) => state.User.topTracks)
            topArtists = yield select((state) => state.User.topArtists)
        }

        const seedTracks = (topTracks || []).slice(0, 2).map((t) => t.id).filter(Boolean)
        const seedArtists = (topArtists || []).slice(0, 3 - seedTracks.length).map((a) => a.id).filter(Boolean)

        if (seedTracks.length || seedArtists.length) {
            const params = { limit: 20 }
            if (seedTracks.length) params.seed_tracks = seedTracks.join(',')
            if (seedArtists.length) params.seed_artists = seedArtists.join(',')
            const response = yield call(axios.get, RECOMMENDATIONS_ENDPOINT, {
                headers: { 'Authorization': 'Bearer ' + token },
                params,
            })
            const tracks = response?.data?.tracks || []
            if (tracks.length) {
                yield put(Actions.getDiscoverFeedSucceeded(tracks, 'recommendations'))
                return
            }
        }

        const fallback = yield call(axios.get, NEW_RELEASES_ENDPOINT, {
            headers: { 'Authorization': 'Bearer ' + token },
            params: { limit: 20 },
        })
        const albums = fallback?.data?.albums?.items || []
        yield put(Actions.getDiscoverFeedSucceeded(albums, 'newReleases'))
    }
    catch(error) {
        yield put(Actions.getDiscoverFeedFailed(error))
    }
}

function* userSaga() {
    yield all([
        yield takeLatest(Actions.UserDataActions.GET_PROFILE_Requested, getProfile),
        yield takeLatest(Actions.UserDataActions.STORE_TOKEN, initializeUserData),
        yield takeLatest(Actions.UserDataActions.GET_TOP_ARTISTS_Requested, getTopArtists),
        yield takeLatest(Actions.UserDataActions.GET_TOP_TRACKS_Requested, getTopTracks),
        yield takeLatest(Actions.UserDataActions.setDatabaseUserRequested, setDatabaseUser),
        yield takeLatest(Actions.UserDataActions.searchSongsRequested, searchSongs),
        yield takeLatest(Actions.UserDataActions.getDiscoverFeedRequested, getDiscoverFeed)
    ]);
}
export default userSaga
