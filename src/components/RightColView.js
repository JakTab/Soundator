import React, { Component } from 'react';
const config = require('electron-json-config');

import './RightColView.scss';

import * as calcFunctions from '../utils/calcFunctions';
import { musicList, songMetadata } from './LeftColView';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faVolumeUp, faBackward, faPlay, faPause, faForward } from "@fortawesome/free-solid-svg-icons";

var audio = new Audio();
var lastSavedVolume;

var currentSong = {	"index": "", "title": "",	"artist": "",	"album": "", "artwork": "" };
currentSong.changeCurrentSong = changeCurrentSong;

function changeCurrentSong(index, title, artist, album, artwork) {
  this.index = index;
  this.title = title;
  this.artist = artist;
  this.album = album;
  this.artwork = artwork;
}

export function playMusicItem(path, imageUrl, index, songData) {
  audio.pause();
  // this.setState({ isPlaying: false });
  audio.src = path;
  audio.currentTime = 0;
  
  document.getElementById("volumeFill").style.width = (audio.volume * 100) + "%";
  lastSavedVolume = audio.volume;

  currentSong.changeCurrentSong(index, songData.title, songData.artist[0], songData.album, imageUrl);

  document.getElementsByClassName("song-name")[0].innerHTML = currentSong.title;
  document.getElementsByClassName("artist-name")[0].innerHTML = currentSong.artist;
  document.getElementsByClassName("album-name")[0].innerHTML = currentSong.album;
  document.getElementsByClassName("song-number")[0].innerHTML = (songData.track.of != 0) ? songData.track.no + "/" + songData.track.of : songData.track.no + "/" + songMetadata.length;
  
  audio.ontimeupdate = () => {
    document.getElementById("currentSongTime").innerHTML = calcFunctions.calcTime(audio.currentTime);
    document.getElementById("timeFill").style.width = calcFunctions.calcProgressBar(audio);
  }

  audio.onloadedmetadata = () => {
    document.getElementById("currentSongDuration").innerHTML = calcFunctions.calcTime(audio.duration);
  }

  audio.onended = () => {
    if (index != musicList.length-1) {
      playMusicItem(musicList[index+1], audio.src, index+1, songMetadata[index+1]);
    } else {
      audio.pause();
      audio.currentTime = 0;
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
  }

  loadConfigFile() {
    console.log(config.all());
  }

  async componentDidMount() {
    await this.loadConfigFile();
    audio.volume = 1;
    lastSavedVolume = audio.volume;
    this.volumeFillChange(audio.volume);
  }

  playButton() {
    if (audio.src != "") {
      if (!audio.paused) {
        audio.pause();
        this.setState({ isPlaying: false });
      } else {
        audio.play();
        this.setState({ isPlaying: true });
      }
    }
  }
  
  backButton(currentSongIndex) {
    if (audio.src != "") {
      if (currentSongIndex > 0) {
        playMusicItem(musicList[currentSongIndex-1], currentSong.artwork, currentSongIndex-1, songMetadata[currentSongIndex-1]);
      }
    }
  }
  
  forwardButton(currentSongIndex) {
    if (audio.src != "") {
      if (currentSongIndex < musicList.length-1) {
        playMusicItem(musicList[currentSongIndex+1], currentSong.artwork, currentSongIndex+1, songMetadata[currentSongIndex+1]);
      }
    }
  }
  
  jumpToSongTime(event) {
    if (audio.src != "") {
      var calculate = calcFunctions.calcDivFillPercentage(event, "TimeFill");
      this.timeFillChange(calculate);
      audio.currentTime = audio.duration * (calculate/100);
    }
  }

  changeSongVolume(event) {
    var calculate = calcFunctions.calcDivFillPercentage(event, "VolumeFill");
    this.volumeFillChange(calculate/100);
    audio.volume = calculate/100;
  }

  changeSongVolumeByBit(event) {
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
    this.volumeFillChange(audio.volume);
  }

  muteUnmuteButton() {
    if (this.state.isMuted) {
      audio.volume = lastSavedVolume; 
    } else {
      audio.volume = 0;
    }
    document.getElementById("volumeFill").style.width = audio.volume * 100 + "%";
    this.setState({ isMuted: !this.state.isMuted });
  }

  toggleLeftColView() {
    document.getElementById("leftColView").classList.toggle("showLeftCol");
    document.getElementById("rightColView").classList.toggle("decreaseRightCol");
  }

  volumeFillChange(vol) {
    document.getElementById("volumeFill").style.width = vol * 100 + "%";
    lastSavedVolume = vol;
  }

  timeFillChange(time) {
    document.getElementById("timeFill").style.width = time + "%";
  }

  render() {
    return (
      <div id="rightColView" className="rightColView">
        <div className="album" id="albumArtwork" />
        <div className="info">
          <div className="progress-bar">
              <div className="time--current" id="currentSongTime">--:--</div>
              <div className="time--total" id="currentSongDuration">--:--</div>
              <div id="divTimeFill" onClick={(e) => this.jumpToSongTime(e)}>
                <div id="timeFill" />
              </div>
          </div>
          <div className="currently-playing">
            <h2 className="song-name" />
            <h3 className="artist-name" />
            <h3 className="album-name" />
          </div>
          <div className="controls">
            <div className="option" onClick={() => this.toggleLeftColView()}><FontAwesomeIcon icon={faBars} /></div>
            <div className="previous" onClick={() => this.backButton(currentSong.index)}><FontAwesomeIcon icon={faBackward} /></div>
            <div className="play" onClick={() => this.playButton()}>
              { this.state.isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} /> }
            </div>
            <div className="next" onClick={() => this.forwardButton(currentSong.index)}><FontAwesomeIcon icon={faForward} /></div>
            <div className="volume" onClick={() => this.muteUnmuteButton()}><FontAwesomeIcon icon={faVolumeUp} /></div>
            <div id="divVolumeFill" onClick={(e) => this.changeSongVolume(e)} onWheel={(e) => this.changeSongVolumeByBit(e)}>
              <div id="volumeFill" />
            </div>
          </div>
          <div className="currently-playing">
            <h3 className="song-number"></h3>
          </div>
        </div>
      </div>
    )
  }
}

export default RightColView;