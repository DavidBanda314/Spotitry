import { UserDataActions } from '../Actions/UserActions.js'

const InitialState = 
{
    profile:{},
    databaseUser: {},
    topArtists: [],
    topTracks: [],
    searchedSongs: [],
    searchedArtists: [],
    searchedAlbums: [],
    searchLoading: false,
    searchError: null,
    discoverFeed: [],
    discoverFeedType: null,
    discoverLoading: false,
    discoverError: null,
    token: '',
    loading:false,
    errors:{},
}

function userReducer(state = InitialState, action){
    const {type} = action
    switch(type){
        case UserDataActions.STORE_TOKEN :{
            const {token} = action 
            return {
                ...state,
                token
            }
        }
        case UserDataActions.GET_PROFILE_Requested: {
            return {
                ...state,
                loading: true
            }
        }
        case UserDataActions.GET_PROFILE_Succeeded: {
            const {profile} = action
            return {
                ...state,
                loading:false,
                profile:profile
            }
        }
        case UserDataActions.GET_PROFILE_Failed: {
            const {errors} = action
            return {
                ...state,
                loading: false,
                errors:errors
            }
        }
        case UserDataActions.GET_TOP_ARTISTS_Requested: {
            return {
                ...state,
                loading:true
            }
        }
        case UserDataActions.GET_TOP_ARTISTS_Succeeded: {
            const { topArtists } = action
            return {
                ...state,
                loading:false,
                topArtists:topArtists
            }
        }
        case UserDataActions.GET_TOP_ARTISTS_Failed: {
            const { errors } = action 
            return {
                ...state,
                loading:false,
                errors:errors
            }
        }
        case UserDataActions.GET_TOP_TRACKS_Requested: {
            return {
                ...state,
                loading:true
            }
        }
        case UserDataActions.GET_TOP_TRACKS_Succeeded: {
            const {topTracks} = action
            return {
                ...state,
                loading:false,
                topTracks:topTracks
            }
        }
        case UserDataActions.GET_TOP_TRACKS_Failed: {
            const { errors } = action 
            return {
                ...state,
                loading:false,
                errors:errors
            }
        }
        case UserDataActions.setDatabaseUserSucceeded: {
            const {user} = action
            return {
                ...state,
                databaseUser:user
            }
        }
        case UserDataActions.setDatabaseUserRequested: {
            return {
                ...state
            }
        }
        case UserDataActions.setDatabaseUserFailed: {
            const { errors } = action 
            return {
                ...state,
                errors:errors
            }
        }
        case UserDataActions.searchSongsRequested: {
            return {
                ...state,
                searchLoading: true,
                searchError: null,
            }
        }
        case UserDataActions.searchSongsSucceeded: {
            const { searchedSongs, searchedArtists, searchedAlbums } = action
            return {
                ...state,
                searchedSongs,
                searchedArtists,
                searchedAlbums,
                searchLoading: false,
                searchError: null,
            }
        }
        case UserDataActions.searchSongsFailed: {
            const { errors } = action 
            return {
                ...state,
                errors:errors,
                searchLoading: false,
                searchError: errors,
            }
        }
        case UserDataActions.getDiscoverFeedRequested: {
            return {
                ...state,
                discoverLoading: true,
                discoverError: null,
            }
        }
        case UserDataActions.getDiscoverFeedSucceeded: {
            const { discoverFeed, discoverFeedType } = action
            return {
                ...state,
                discoverFeed,
                discoverFeedType,
                discoverLoading: false,
                discoverError: null,
            }
        }
        case UserDataActions.getDiscoverFeedFailed: {
            const { errors } = action
            return {
                ...state,
                discoverLoading: false,
                discoverError: errors,
            }
        }
        default:{
            return state;
        }
    }
}
export default userReducer