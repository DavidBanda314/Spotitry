import React, { useState } from 'react'
import {Card, CardImg, CardBody, CardTitle, CardSubtitle, Col, CardHeader} from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useHistory } from 'react-router-dom';


const DisplayCard = (props) => {
    const {token, track, artistName,albumName, albumCover, trackName, setSelectedSong, selectedSong} = props;
    return(
        <Col style={{height: '50%', display: 'flex', marginTop: "10px"}}
            onClick={() => {
                selectedSong?.song?.album?.uri == track.album.uri ?
                    setSelectedSong(0,track.uri,track)
                    :
                    setSelectedSong(track.track_number-1,track.album?.uri,track);        
            }}
        >
            <Card style={{cursor:'pointer', width: '210px', height: "500px", backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden'}}>
                <CardImg top width="100%" alt="Album Cover" style={{width:'210px', borderRadius: '0'}} src={albumCover}/>
                <CardHeader style={{backgroundColor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                    <CardTitle tag="h5" style={{color: '#FFFFFF', fontWeight: 700, fontSize: '14px'}}>{trackName}</CardTitle>
                </CardHeader>
                <CardBody>
                    <CardSubtitle tag="h6" style={{color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px'}}>{artistName}</CardSubtitle>
                    <CardSubtitle tag="h6" style={{color: 'rgba(255,255,255,0.4)', fontSize: '12px'}}>{albumName}</CardSubtitle>
                </CardBody>
            </Card>
        </Col>
    )
}

export default DisplayCard;
