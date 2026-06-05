import styles from  './unauthenticated.module.css'
import React, { useEffect, useState, useCallback} from "react";
import { clientId, hash, scopes, signUp, authEndpoint, generatePKCEChallenge} from '../../utils/constants'


const features = [
  { title: 'Top Songs & Artists', desc: 'Your most played tracks and favorite artists, indexed.' },
  { title: 'Listening History', desc: 'Browse and search everything you have recently played.' },
  { title: 'Timestamps', desc: 'Save and revisit your favorite moments in any song.' },
]

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
        <header className={styles.topBar}>
          <span className={styles.brand}>SPOTITRY</span>
          <span className={styles.tag}>{'///MUSIC INDEX'}</span>
        </header>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>THE ULTIMATE HOME FOR MUSIC</h1>
          <p className={styles.heroSubtitle}>
            Discover your top tracks, explore your listening history, and timestamp your favorite moments.
          </p>
          <div className={styles.buttonGroup}>
            {!accessToken && (
              <button className={styles.loginButton} onClick={handleLogin}>
                [ LOG IN WITH SPOTIFY <span className={styles.arrow}>&#8599;</span> ]
              </button>
            )}
            {!accessToken && (
              <a className={styles.signUpButton} href={`${signUp}`}>
                [ SIGN UP FREE <span className={styles.arrow}>&#8599;</span> ]
              </a>
            )}
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featuresTitle}>{'///EVERYTHING YOU NEED'}</div>
          <ul className={styles.featureList}>
            {features.map((f, i) => (
              <li className={styles.featureRow} key={f.title}>
                <span className={styles.featureNum}>#{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.featureTitle}>{f.title}</span>
                <span className={styles.featureDesc}>{f.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.footer}>
          &copy; 2024 SPOTITRY &middot; POWERED BY SPOTIFY
        </div>
      </div>
    );
  }

  export default UnauthenticatedApp;
