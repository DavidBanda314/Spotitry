import React, { useState, useEffect } from 'react'
import styles from './index.module.css'
import {Tabs, Tab, Paper} from '@material-ui/core'
import { useHistory } from 'react-router-dom';


const NavBar = () => {
    const [tab,setTab] = useState(0);
    const history = useHistory()
    const tabs = ['home','history','timestamps','discover','account']

    useEffect(() => {
        const path = window.location.pathname;
        const tab = path.substring(1, 2).toLowerCase() + path.substring(2)
        setTab(tabs.indexOf(tab));
        history.push(tab)

      }, []);
    return(
        <>
        <Paper>
            <Tabs
                className={styles.tabs}
                value={tab}
                onChange={(event,value)=>(
                    setTab(value),
                    history.push(tabs[value])
                )}
                indicatorColor='primary'
                centered
            >
                <Tab label="Home" />
                <Tab label="History"/>
                <Tab label="Timestamps"/>
                <Tab label="Discover"/>
                <Tab label="Account"/>
            </Tabs>
        </Paper>
        </>
    )
}

export default NavBar;