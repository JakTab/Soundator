import React, { Component } from 'react';
import img from '../../assets/cover.jpg';

import './RightColView.scss';

import { currentSong, musicList, calcTime, calcProgressBar } from './App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faVolumeUp, faBackward, faPlay, faPause, faForward } from "@fortawesome/free-solid-svg-icons";

var audio = new Audio(); 
audio.volume = 1;
var lastSavedVolume = audio.volume;


export function playMusicItem(path, imageUrl, index) {
  audio.pause();
  // this.setState({ isPlaying: false });
  audio.src = path;
  audio.currentTime = 0;
  
  document.getElementById("volumeFill").style.width = (audio.volume * 100) + "%";
  lastSavedVolume = audio.volume;

  currentSong.index = index;
  currentSong.artwork = imageUrl;
  // currentSong.title = songData.title;
  // currentSong.artist = songData.artist[0];
  // currentSong.album = songData.album;

  audio.ontimeupdate = () => {
    document.getElementById("currentSongTime").innerHTML = calcTime(audio.currentTime);
    document.getElementById("fill").style.width = calcProgressBar(audio);
  }
  audio.onloadedmetadata = function() {
    document.getElementById("currentSongDuration").innerHTML = calcTime(audio.duration);
  };
  audio.onended = () => {
    if (index != musicList.length-1 && index > -1) {
      playMusicItem(musicList[index+1], audio.src, index+1);
    } else {
      audio.pause();
      // this.setState({ isPlaying: false });
    }
  }
  console.log("Now playing: " + audio.src);
  document.getElementById("albumArtwork").style.backgroundImage = "url(" + currentSong.artwork + ")";
  audio.play();
  // this.setState({ isPlaying: true });
}

class RightColView extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isPlaying: false,
        isMuted: false,
    }
    this.playButton = this.playButton.bind(this);
  }

  componentDidMount() {
    document.getElementById("volumeFill").style.width = (audio.volume * 100) + "%";
  }

  async playButton() {
    if (!audio.paused) {
      audio.pause();
      this.setState({ isPlaying: false });
    } else {
      audio.play();
      this.setState({ isPlaying: true });
    }
  }
  
  backButton(currentSongIndex) {
    if (currentSongIndex > 0) {
      playMusicItem(musicList[currentSongIndex-1], currentSong.artwork, currentSongIndex-1);
    }
  }
  
  forwardButton(currentSongIndex) {
    if (currentSongIndex < musicList.length-1) {
      playMusicItem(musicList[currentSongIndex+1], currentSong.artwork, currentSongIndex+1);
    }
  }
  
  jumpToSongTime(event) {
    var rect =  document.getElementById("divFill").getBoundingClientRect();
    var startX = rect.x;
    var endX = startX + rect.width;
    var clickedX = event.clientX;
  
    var calculate = ((clickedX-startX)/(endX-startX))*100;
    document.getElementById("fill").style.width = calculate + "%";
    audio.currentTime = audio.duration * (calculate/100);
  }

  changeSongVolume(event) {
    var rect =  document.getElementById("divVolumeFill").getBoundingClientRect();
    var startX = rect.x;
    var endX = startX + rect.width;
    var clickedX = event.clientX;
  
    var calculate = ((clickedX-startX)/(endX-startX))*100;
    document.getElementById("volumeFill").style.width = calculate + "%";
    audio.volume = calculate/100;
    lastSavedVolume = audio.volume;
    console.log(audio.volume);
  }

  changeSongVolumeByBit(event) {
    event.persist();
    console.log(event);
    var volumeChange = 0;
    if (event.deltaY < 0) {
      //up
      volumeChange = audio.volume + 0.1;
      if (volumeChange > 1) volumeChange = 1;
    } else if (event.deltaY > 0) {
      //down
      volumeChange = audio.volume - 0.1;
      if (volumeChange < 0) volumeChange = 0;
    }
    audio.volume = volumeChange;
    lastSavedVolume = audio.volume;
    document.getElementById("volumeFill").style.width = audio.volume*100 + "%";
    console.log(audio.volume)
  }

  muteUnmuteButton() {
    if (this.state.isMuted) {
      audio.volume = lastSavedVolume; 
    } else {
      audio.volume = 0;
    }
    document.getElementById("volumeFill").style.width = audio.volume*100 + "%";
    this.setState({ isMuted: !this.state.isMuted })
  }

  render() {
    return (
      <div id="rightColView">
          <div className="album" id="albumArtwork" style={{backgroundImage: "url("+ img +")"}}></div>
          <div className="info">
              <div className="progress-bar">
                  <div className="time--current" id="currentSongTime">--:--</div>
                  <div className="time--total" id="currentSongDuration">--:--</div>
                  <div id="divFill" onClick={(e) => this.jumpToSongTime(e)}>
                    <div id="fill"></div>
                  </div>    
              </div>
              <div className="currently-playing">
                  <h2 className="song-name">{currentSong.title}</h2>
                  <h3 className="artist-name">{currentSong.artist}</h3>
                  <h3 className="album-name">{currentSong.album}</h3>
              </div>
              <div className="controls">
                  <div className="option"><FontAwesomeIcon icon={faBars} /></div>
                  <div className="previous" onClick={() => this.backButton(currentSong.index)}><FontAwesomeIcon icon={faBackward} /></div>
                  <div className="play" onClick={() => this.playButton()}>
                    {
                      this.state.isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />
                    }
                  </div>
                  <div className="next" onClick={() => this.forwardButton(currentSong.index)}><FontAwesomeIcon icon={faForward} /></div>
                  <div className="volume" onClick={() => this.muteUnmuteButton()}><FontAwesomeIcon icon={faVolumeUp} /></div>
                  <div id="divVolumeFill" onClick={(e) => this.changeSongVolume(e)} onWheel={(e) => this.changeSongVolumeByBit(e)}>
                    <div id="volumeFill"></div>
                  </div> 
              </div>
              <div className="currently-playing">
                    <h3 className="song-number">{currentSong.index}</h3>
                </div>
          </div>
      </div>
    )
  }
}

export default RightColView;