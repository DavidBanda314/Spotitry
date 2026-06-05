import styles from  './unauthenticated.module.css'
import React, { useEffect, useState, useCallback} from "react";
import { spotifyLogo, clientId, hash, scopes, signUp, authEndpoint, generatePKCEChallenge} from '../../utils/constants'
import {Tabs, Tab, Button, Box} from '@material-ui/core'

const UnauthenticatedApp = () => {
    const [accessToken, setAccessToken] = useState()
    useEffect(() => {
      let _token = hash.access_token;
      if (_token) {
        setAccessToken({
          token: _token
        });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[hash.access_token])

    const redirectUri = window.location.origin + '/home'

    const handleLogin = useCallback(async () => {
      const codeChallenge = await generatePKCEChallenge();
      const authUrl = `${authEndpoint}client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join("%20")}&response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}&show_dialog=true`;
      window.location.href = authUrl;
    }, [redirectUri]);

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
            <a className={styles.loginButton} href="#" onClick={(e) => { e.preventDefault(); handleLogin(); }}>
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
