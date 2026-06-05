import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect} from 'react-router-dom';
import Home from './domains/main/Home';
import NavBar from './components/NavBar';
import Timestamps from './domains/main/Timestamps';
import Account from './domains/main/Account';
import Discover from './domains/main/Discover';
import History from './domains/main/History';
import { StoreToken } from './domains/main/redux/Actions/UserActions.js'
import { getPlaybackInfoRequested } from './domains/main/redux/Actions/PlaybackActions.js'
import { connect } from 'react-redux'
import SpotifyPlayer from 'react-spotify-web-playback';
import styles from './authenticated-app.module.css';

const AuthenticatedApp = (props) => {
  var {token, storeToken, selectedSong, getPlaybackInfo, userId} = props
  const {position_ms, song, songURI} = selectedSong
  const [timestampSaved, setTimestampSaved] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    if(!token){
      storeToken(localStorage.getItem("token"))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const handleTimestamp = () => {
    if (token && userId) {
      setShowNoteInput(true);
    }
  };

  const saveTimestampWithNote = () => {
    getPlaybackInfo(token, 1, userId, noteText || undefined);
    setTimestampSaved(true);
    setShowNoteInput(false);
    setNoteText('');
    setTimeout(() => setTimestampSaved(false), 2000);
  };

  const cancelNote = () => {
    setShowNoteInput(false);
    setNoteText('');
  };

    return(
      <div>
      {token &&
      <>
      <header className={styles.topBar}>
        <span className={styles.brand}>Spoti<span className={styles.brandAccent}>try</span></span>
      </header>
      {song && 
      <div className={styles.player}>
        {showNoteInput && (
          <div style={{
            backgroundColor: '#282828',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTimestampWithNote(); if (e.key === 'Escape') cancelNote(); }}
              placeholder="Add a note (optional)..."
              autoFocus
              style={{
                flex: 1,
                backgroundColor: '#3a3a3a',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '500px',
                padding: '8px 16px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={saveTimestampWithNote}
              style={{
                backgroundColor: '#1DB954',
                color: '#000',
                border: 'none',
                borderRadius: '500px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={cancelNote}
              style={{
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '500px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#000000',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{flex: 1}}>
            <SpotifyPlayer
              styles={{
                bgColor:'#000000',
                color:'#FFFFFF',
                trackNameColor:'#FFFFFF',
                trackArtistColor:'rgba(255, 255, 255, 0.6)',
                sliderColor:'#1DB954',
                sliderHandleColor:'#FFFFFF',
                sliderTrackColor:'rgba(255, 255, 255, 0.2)',
              }}
              token={token}
              uris={[songURI]}
              offset={position_ms}
              autoPlay={true}
              showSaveIcon={true}
              persistDeviceSelection={true}
            />
          </div>
          <button
            onClick={handleTimestamp}
            title="Save timestamp"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: '20px',
              color: timestampSaved ? '#1DB954' : 'rgba(255,255,255,0.7)',
              transition: 'color 0.2s ease',
              flexShrink: 0,
            }}
          >
            {timestampSaved ? '✓ Saved' : '⏱'}
          </button>
        </div>
      </div>
      }
      <main className={`${styles.content} ${song ? styles.withPlayer : ''}`}>
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            return <Redirect to="/home" />;
          }}
        />
        <Route
          exact path='/home'
        >
          <Home/>
        </Route>
        <Route
          exact path='/timestamps'
          >
          <Timestamps/>
        </Route>
        <Route
          exact path='/account'
        >
          <Account/>
        </Route>
        <Route
          exact path='/discover'
        >
          <Discover/>
        </Route>
        <Route
          exact path='/history'
        >
          <History/>
        </Route>
      </Switch>
      </main>
      <NavBar/>
      </>
      }
    </div>
          
    )
}
const mapDispatchToProps = (dispatch) => {
  return{
      storeToken: (token) => dispatch(StoreToken(token)),
      getPlaybackInfo: (token, create, userId, note) => dispatch(getPlaybackInfoRequested(token, create, userId, note)),
  }
}
const mapStateToProps = (state) => {
  return{
    token:state.User.token,
    selectedSong:state.Player.selectedSong,
    userId: state.User.databaseUser.userId,
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(AuthenticatedApp);
