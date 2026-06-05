import styles from  './unauthenticated.module.css'
import React, { useEffect, useState} from "react";
import { spotifyLogo, clientId, redirectUri, hash, scopes, signUp, authEndpoint} from '../../utils/constants'
import {Tabs, Tab, Button, Box} from '@material-ui/core'

const UnauthenticatedApp = () => {
    const [accessToken, setAccessToken] = useState()
    useEffect(() => {
      let _token = hash.access_token;
      if (_token) {
        // Set token
        setAccessToken({
          token: _token
        });
      }
    },[hash.access_token])
    const redirectUri = `${window.location.href}home`
    console.log(redirectUri)
    return (
      <div className={styles.App}>
            <div className={styles.header}>
              <span style={{fontSize: '24px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em'}}>Spotitry</span>
            </div>
        <header className={styles.AppHeader}>
        
        <img src={spotifyLogo} className={styles.AppLogo} alt="Spotify Logo" />
        <h1 className={styles.heroTitle}>The ultimate home for music</h1>
        <p className={styles.heroSubtitle}>
          Discover your top tracks, explore your listening history, and create timestamps for your favorite moments.
        </p>
        <div className={styles.buttonGroup}>
          {!accessToken && (
            <a className={styles.loginButton} href={`${authEndpoint}client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}>
              Log in with Spotify
            </a>
          )}
          {!accessToken && (
            <a className={styles.signUpButton} href={`${signUp}`}>
              Sign up free
            </a>
          )}
        </div>
        </header>

        <section className={styles.features}>
          <h2 className={styles.featuresTitle}>Everything you need to explore your music</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureCardTitle}>Top Songs & Artists</div>
              <div className={styles.featureCardDesc}>See your most played tracks and favorite artists, all in one place.</div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureCardTitle}>Listening History</div>
              <div className={styles.featureCardDesc}>Browse and search through your recently played tracks with ease.</div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureCardTitle}>Timestamps</div>
              <div className={styles.featureCardDesc}>Save and revisit your favorite moments in any song.</div>
            </div>
          </div>
        </section>

        <div className={styles.footer}>
          &copy; 2024 Spotitry &middot; Powered by Spotify
        </div>
      </div>
    );
  }
  
  export default UnauthenticatedApp;
