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
        <span className={styles.brand}>SPOTI<span className={styles.brandAccent}>TRY</span></span>
        <span style={{fontSize: '12px', color: '#40aaff'}}>{'///PLAYER'}</span>
      </header>
      {song && 
      <div className={styles.player}>
        {showNoteInput && (
          <div style={{
            backgroundColor: '#000000',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderTop: '1px solid rgba(132,137,142,0.4)',
          }}>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTimestampWithNote(); if (e.key === 'Escape') cancelNote(); }}
              placeholder="ADD A NOTE (OPTIONAL)..."
              autoFocus
              style={{
                flex: 1,
                backgroundColor: '#000000',
                border: '1px solid rgba(132,137,142,0.4)',
                borderRadius: '0',
                padding: '8px 12px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                textTransform: 'uppercase',
              }}
            />
            <button
              onClick={saveTimestampWithNote}
              style={{
                backgroundColor: '#ffc700',
                color: '#000',
                border: 'none',
                borderRadius: '0',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Save
            </button>
            <button
              onClick={cancelNote}
              style={{
                backgroundColor: 'transparent',
                color: '#84898e',
                border: '1px solid rgba(132,137,142,0.4)',
                borderRadius: '0',
                padding: '8px 16px',
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'uppercase',
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
          borderTop: '1px solid rgba(132,137,142,0.4)',
        }}>
          <div style={{flex: 1}}>
            <SpotifyPlayer
              styles={{
                bgColor:'#000000',
                color:'#FFFFFF',
                trackNameColor:'#FFFFFF',
                trackArtistColor:'#84898e',
                sliderColor:'#ffc700',
                sliderHandleColor:'#FFFFFF',
                sliderTrackColor:'rgba(132, 137, 142, 0.4)',
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
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: timestampSaved ? '#ffc700' : '#84898e',
              transition: 'color 0.2s ease',
              flexShrink: 0,
            }}
          >
            {timestampSaved ? '[SAVED]' : '[+TS]'}
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
