//Firebase
import firebase from 'firebase/app'
import "firebase/auth";
import "firebase/database";

var firebaseConfig = {
  apiKey: "AIzaSyDaeiVFGwFlPRRv-PmJGPfR5uy0Mq6sI4E",
  authDomain: "spotitry-4ca96.firebaseapp.com",
  databaseURL: "https://spotitry-4ca96-default-rtdb.firebaseio.com",
  projectId: "spotitry-4ca96",
  storageBucket: "spotitry-4ca96.appspot.com",
  messagingSenderId: "114096662793",
  appId: "1:114096662793:web:98352476fe4fddd00ccbd8",
  measurementId: "G-K4DMSYDJ8B"
};
firebase.initializeApp(firebaseConfig);
export const db = firebase.database();
export const auth = firebase.auth();
export const Firebase = firebase;

//Spotify API 
export const authEndpoint = 'https://accounts.spotify.com/authorize?';
export const signUp = 'https://www.spotify.com/signup/'
export const spotifyLogo = 'https://1000logos.net/wp-content/uploads/2017/08/Spotify-Logo.png'
export const clientId = "4604d772bd3e4fe69399830809371aa4";
export const redirectUri = `${window.location.href}home`
export const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-read-recently-played",
    "user-top-read",
    "user-read-playback-position",
    'user-modify-playback-state',
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-library-modify',
    "playlist-modify-public",
    "playlist-modify-private",
    "playlist-read-private",
    "playlist-read-collaborative",
    'streaming',
  ];

export const PROFILE_ENDPOINT  = 'https://api.spotify.com/v1/me'
export const TOP_ARTISTS_ENDPOINT = 'https://api.spotify.com/v1/me/top/artists'
export const TOP_TRACKS_ENDPOINT = 'https://api.spotify.com/v1/me/top/tracks'
export const SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search'
export const PLAYER_ENDPOINT = 'https://api.spotify.com/v1/me/player'

// PKCE helpers
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(arrayBuffer) {
  let str = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function generatePKCEChallenge() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlencode(hashed);
  sessionStorage.setItem('code_verifier', codeVerifier);
  return codeChallenge;
}

export async function exchangeCodeForToken(code) {
  const codeVerifier = sessionStorage.getItem('code_verifier');
  const redirectUri = window.location.origin + '/home';
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body,
  });
  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('expiration', (new Date().getTime() + data.expires_in * 1000));
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    sessionStorage.removeItem('code_verifier');
  }
  return data;
}

// Legacy hash parser (kept for backward compatibility during transition)
export const hash = window.location.hash
.substring(1)
.split("&")
.reduce(function(initial, item) {
    if (item) {
    var parts = item.split("=");
    initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    if(initial.access_token){
      localStorage.setItem("token", initial.access_token)
      localStorage.setItem("expiration", (new Date().getTime() + 24 * 60 * 10 * 1000))
    }
    return initial;
}, {});
window.location.hash = "";



export function parseSpecialCharacters(string){
    var newString = string.replace(/[^a-zA-Z0-9]/g, '')
    return(newString)
}