import React, { useState, useEffect } from "react";
import {hash, exchangeCodeForToken} from './utils/constants'
import UnauthenticatedApp from './domains/login/unauthenticated-app'
import AuthenticatedApp from './authenticated-app'
import {useHistory } from "react-router-dom";

const App = (props) => {
  const currentTime = new Date().getTime();
  const expiration = localStorage.getItem('expiration');
  if (expiration && currentTime > expiration) {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('refresh_token');
  }

  const [authCode] = useState(() => new URLSearchParams(window.location.search).get('code'))
  const [isLoggedIn, setIsLoggedIn] = useState(hash.access_token || !!localStorage.getItem("token"))
  const [isExchanging, setIsExchanging] = useState(!!authCode && !localStorage.getItem('token'))
  const history = useHistory()
  var domain = window.location.pathname

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
