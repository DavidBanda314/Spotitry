import styles from  './unauthenticated.module.css'
import React, { useEffect, useState, useCallback} from "react";
import { spotifyLogo, clientId, hash, scopes, signUp, authEndpoint, generatePKCEChallenge} from '../../utils/constants'
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
    const redirectUri = window.location.origin + '/home'

    const handleLogin = useCallback(async () => {
      const codeChallenge = await generatePKCEChallenge();
      window.location.href = `${authEndpoint}client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join("%20")}&response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}&show_dialog=true`;
    }, [redirectUri]);

    return (
      <div className={styles.App}>
            <Tabs
              className={styles.header}
              value={false}
              centered
            >
              <Tab style={{fontSize: '36px'}}label="Spotitry" />
            </Tabs>
        <header className={styles.AppHeader}>
        
        <img src={spotifyLogo} className={styles.AppLogo} alt="Spotify Logo" />
        <br></br>
        <Box display="flex" justifyContent="space-between">
          {!accessToken && (
            <Button style={{height: '50px', width: '100px', margin: "20px"}} className={styles.dumb} variant="contained" onClick={handleLogin}>
              Login
            </Button>
          )}
          {!accessToken && (
            <Button style={{height: '50px', width: '100px', margin: "20px"}} variant="contained" href={`${signUp}`}>
              Sign Up
            </Button>
          )}
        </Box>
        </header>
      </div>
    );
  }
  
  export default UnauthenticatedApp;