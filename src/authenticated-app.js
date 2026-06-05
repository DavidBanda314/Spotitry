import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Home from './domains/main/Home';
import NavBar from './components/NavBar';
import Timestamps from './domains/main/Timestamps';
import Account from './domains/main/Account';
import Discover from './domains/main/Discover';
import History from './domains/main/History';
import Stats from './domains/main/Stats';
import Search from './domains/main/Search';
import GlobalSearch from './components/GlobalSearch';
import Share from './domains/main/Share';
import Profile from './domains/main/Profile';
import Compare from './domains/main/Compare';
import Artist from './domains/main/Artist';
import { StoreToken } from './domains/main/redux/Actions/UserActions.js'
import { getPlaybackInfoRequested, setDeviceId } from './domains/main/redux/Actions/PlaybackActions.js'
import { connect } from 'react-redux'
import SpotifyPlayer from 'react-spotify-web-playback';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import NowPlaying from './components/NowPlaying';
import styles from './authenticated-app.module.css';

function formatMs(ms) {
  var totalSec = Math.floor(ms / 1000)
  var min = Math.floor(totalSec / 60)
  var sec = totalSec % 60
  return min + ':' + (sec < 10 ? '0' : '') + sec
}

const AuthenticatedApp = (props) => {
  var {token, storeToken, selectedSong, getPlaybackInfo, userId, storeDeviceId} = props
  const {position_ms, song, songURI, startPositionMs} = selectedSong
  const [timestampSaved, setTimestampSaved] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [play, setPlay] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [progressMs, setProgressMs] = useState(0)
  const [durationMs, setDurationMs] = useState(0)
  const location = useLocation()

  useEffect(() => {
    if(!token){
      storeToken(localStorage.getItem("token"))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(() => {
    if(selectedSong?.songURI){
      // For positioned (timestamp) plays, do NOT let the component auto-start
      // from 0:00 — the saga's device-targeted play starts it at the saved time.
      setPlay(!selectedSong?.startPositionMs)
    }
  },[selectedSong])

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
        <GlobalSearch/>
      </header>
      <div className={`${styles.player} ${expanded ? styles.playerExpanded : ''} ${!song ? styles.playerHidden : ''}`}>
        {song && expanded && (
          <NowPlaying
            song={song}
            saved={timestampSaved}
            onCollapse={() => setExpanded(false)}
            onSave={handleTimestamp}
          />
        )}
        {song && showNoteInput && (
          <div style={{
            backgroundColor: 'var(--surface)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderTop: '1px solid var(--border-2)',
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
                minWidth: 0,
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border-strong)',
                borderRadius: '8px',
                padding: '9px 14px',
                color: 'var(--text)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={saveTimestampWithNote}
              style={{
                flexShrink: 0,
                backgroundColor: 'var(--accent)',
                color: 'var(--on-accent)',
                border: 'none',
                borderRadius: '500px',
                padding: '9px 18px',
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
                flexShrink: 0,
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-strong-2)',
                borderRadius: '500px',
                padding: '9px 14px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}
        <div className={styles.playerRow}>
          {song && !expanded && (
            <>
            <button
              onClick={() => setExpanded(true)}
              aria-label="Expand player"
              title="Expand"
              className={styles.expandButton}
            >
              <FontAwesomeIcon icon={faChevronUp} />
            </button>
            <div className={styles.miniInfo} onClick={() => setExpanded(true)}>
              {song?.album?.images?.[0]?.url && (
                <img className={styles.miniArt} src={song.album.images[0].url} alt="" />
              )}
              <div className={styles.miniMeta}>
                <span className={styles.miniTitle}>{song?.name}</span>
                <span className={styles.miniArtist}>{song?.artists?.[0]?.name}</span>
              </div>
              <span className={styles.miniTime}>
                {formatMs(progressMs)}{durationMs ? ' / ' + formatMs(durationMs) : ''}
              </span>
            </div>
            </>
          )}
          <div style={{flex: 1, display: (song && expanded) ? 'block' : 'none'}}>
            <SpotifyPlayer
              styles={{
                bgColor:'transparent',
                color:'var(--text)',
                trackNameColor:'var(--text)',
                trackArtistColor:'var(--text-secondary)',
                sliderColor:'var(--accent)',
                sliderHandleColor:'var(--text)',
                sliderTrackColor:'var(--border-strong-2)',
              }}
              token={token}
              uris={songURI ? [songURI] : []}
              offset={position_ms}
              play={play}
              autoPlay={!startPositionMs}
              callback={(state) => {
                setPlay(state.isPlaying)
                const id = state.currentDeviceId || state.deviceId
                if (id) { storeDeviceId(id) }
                if (state.progressMs !== undefined) { setProgressMs(state.progressMs) }
                if (state.track && state.track.durationMs) { setDurationMs(state.track.durationMs) }
              }}
              showSaveIcon={true}
              persistDeviceSelection={true}
            />
          </div>

        </div>
      </div>
      <main className={`${styles.content} ${song ? styles.withPlayer : ''}`}>
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.pathname}
          classNames={{
            enter: styles.fadeEnter,
            enterActive: styles.fadeEnterActive,
            exit: styles.fadeExit,
            exitActive: styles.fadeExitActive,
          }}
          timeout={200}
        >
          <Switch location={location}>
            <Route
              exact
              path="/"
              render={() => {
                return <Redirect to="/home" />;
              }}
            />
            <Route exact path='/home'>
              <Home/>
            </Route>
            <Route exact path='/timestamps'>
              <Timestamps/>
            </Route>
            <Route exact path='/account'>
              <Account/>
            </Route>
            <Route exact path='/discover'>
              <Discover/>
            </Route>
            <Route exact path='/search'>
              <Search/>
            </Route>
            <Route exact path='/history'>
              <History/>
            </Route>
            <Route exact path='/stats'>
              <Stats/>
            </Route>
            <Route exact path='/share'>
              <Share/>
            </Route>
            <Route exact path='/profile/:userId'>
              <Profile/>
            </Route>
            <Route exact path='/compare'>
              <Compare/>
            </Route>
            <Route exact path='/artist/:id'>
              <Artist/>
            </Route>
          </Switch>
        </CSSTransition>
      </TransitionGroup>
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
      storeDeviceId: (deviceId) => dispatch(setDeviceId(deviceId)),
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
