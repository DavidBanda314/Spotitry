import React, { useState, useEffect } from "react";
import {hash, exchangeCodeForToken, refreshAccessToken} from './utils/constants'
import UnauthenticatedApp from './domains/login/unauthenticated-app'
import AuthenticatedApp from './authenticated-app'
import {useHistory } from "react-router-dom";

const App = (props) => {
  const [authCode] = useState(() => new URLSearchParams(window.location.search).get('code'))
  const [isLoggedIn, setIsLoggedIn] = useState(hash.access_token || !!localStorage.getItem("token"))
  const [isExchanging, setIsExchanging] = useState(!!authCode && !localStorage.getItem('token'))
  const history = useHistory()
  var domain = window.location.pathname

  // Handle token expiration: try refresh before logging out
  useEffect(() => {
    const currentTime = new Date().getTime();
    const expiration = localStorage.getItem('expiration');
    if (expiration && currentTime > expiration) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        setIsExchanging(true);
        refreshAccessToken().then((data) => {
          if (data && data.access_token) {
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('expiration');
            localStorage.removeItem('refresh_token');
            setIsLoggedIn(false);
          }
          setIsExchanging(false);
        }).catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('expiration');
          localStorage.removeItem('refresh_token');
          setIsLoggedIn(false);
          setIsExchanging(false);
        });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        setIsLoggedIn(false);
      }
    }
  }, []);

  // Set up a timer to refresh the token before it expires
  useEffect(() => {
    const expiration = localStorage.getItem('expiration');
    if (!expiration || !isLoggedIn) return;
    const timeUntilExpiry = parseInt(expiration) - new Date().getTime();
    // Refresh 5 minutes before expiration
    const refreshIn = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);
    const timer = setTimeout(() => {
      refreshAccessToken().then((data) => {
        if (data && data.access_token) {
          localStorage.setItem('token', data.access_token);
          // Force re-render to pick up new token
          window.dispatchEvent(new Event('token-refreshed'));
        }
      });
    }, refreshIn);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  // Handle initial PKCE code exchange
  useEffect(() => {
    if (authCode && !localStorage.getItem('token')) {
      setIsExchanging(true);
      exchangeCodeForToken(authCode).then((data) => {
        if (data.access_token) {
          setIsLoggedIn(true);
        }
        setIsExchanging(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(() => {
        setIsExchanging(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [authCode]);

  if (isExchanging) {
    return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Logging in...</div>;
  }

  if(isLoggedIn || localStorage.getItem("token")){
    return(
      <AuthenticatedApp/>
    )
  }
  if(domain !== '/' && !authCode){
    history.push('/') 
  }
  return <UnauthenticatedApp/>
}
export default (App);
