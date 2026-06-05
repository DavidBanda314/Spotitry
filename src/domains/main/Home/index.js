import React from 'react'
import styles from './index.module.css'
import { playSongRequested , setSelectedSong, getPlaybackInfoRequested} from '../redux/Actions/PlaybackActions.js'
import { connect } from 'react-redux'
import { Card, CardImg, CardBody, CardTitle, CardHeader, CardSubtitle, Col, Row} from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';


const Home = (props) => {
    var { token, topTracks, topArtists, setSelectedSong, selectedSong, getPlaybackInfo } = props
    return(

        <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Your Top Songs</h4>
            </div>
            <div>
                <Row style={{marginBottom: "20px"}}>
                {topTracks.slice(0,10)?.map((track,key) => {
                    return(
                        <Col style={{display: 'flex', marginTop: "16px"}}
                            onClick={() => {
                                if (selectedSong?.song?.album?.uri === track.album.uri) {
                                    setSelectedSong(0,track.uri,track);
                                } else {
                                    setSelectedSong(track.track_number-1,track.album?.uri,track);
                                }
                                getPlaybackInfo(token,0,0);
                            }}
                        >
                            <Card style={{cursor:'pointer', width: '210px', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s ease'}}>
                                <CardImg top width="100%" alt="Album Cover" style={{width:'210px', borderRadius: '0'}} src={track.album.images[0].url}/>
                                <CardHeader style={{backgroundColor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                                    <CardTitle tag="h5" style={{color: '#FFFFFF', fontWeight: 700, fontSize: '14px'}}>{key+1}.  {track.name}</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    <CardSubtitle tag="h6" style={{color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '4px'}}>{track.artists[0].name}</CardSubtitle>
                                    <CardSubtitle tag="h6" style={{color: 'rgba(255,255,255,0.4)', fontSize: '12px'}}>{track.album.name}</CardSubtitle>
                                </CardBody>
                            </Card>
                        </Col>
                    )
                })}
                </Row>
            </div>
            <div className={styles.sectionHeader}>
                <h4 className={styles.sectionTitle}>Your Top Artists</h4>
            </div>
            <div>
                <Row style={{justifyContent: 'center'}}>
                {topArtists.slice(0,10)?.map((artist,key) => {
                    return(
                        <Col style={{ display: 'flex', margin:'15px'}}>
                            <Card style={{height:'300px', width:'200px', cursor: 'pointer', backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden'}} 
                                onClick={() => {
                                    setSelectedSong(Math.floor(Math.random() * 10),artist.uri,artist);
                                    getPlaybackInfo(token,0,0);
                                }}>
                                <CardImg alt="Artist Pic" style={{width:'200px', height: '200px', borderRadius: '0'}} src={artist.images[0].url}/>
                                <CardHeader style={{height:'100px', backgroundColor: 'transparent'}}>
                                    <CardTitle tag="h5" style={{color: '#FFFFFF', fontWeight: 700, fontSize: '14px'}}>{key+1}.  {artist.name}</CardTitle>
                                </CardHeader>
                            </Card>
                        </Col>
                    )
                })}  
                </Row>           
            </div>
        </div>
        
    )
}

const mapDispatchToProps = (dispatch) => {
    return {
        playSong: (token, deviceId, songURI, song) => dispatch(playSongRequested(token, deviceId, songURI,song)),
        setSelectedSong: (token, songURI, song) => dispatch(setSelectedSong(token, songURI, song)),
        getPlaybackInfo: (token,create,userId) => dispatch(getPlaybackInfoRequested(token,create,userId)),
    }
}
const mapStateToProps = (state) => {
    return {
        token:state.User.token,
        topTracks:state.User.topTracks,
        topArtists: state.User.topArtists,
        selectedSong: state.Player.selectedSong

    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Home);
