/* Imports */
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faVolumeUp, faBackward, faPlay, faForward } from "@fortawesome/free-solid-svg-icons";
import * as Store from 'electron-store';
import * as Mousetrap from 'mousetrap';
import './RightColView.scss';
import * as calcFunctions from '../utils/calcFunctions';
import audioController from '../utils/audioController';
import { musicList, songsMetadata, goToFolder } from './LeftColView';

/* Globals */
var config = new Store();
var audio = new audioController();
var lastSavedVolume;

export var currentSong = { "index": "", "title": "",	"artist": "",	"album": "", "artwork": "", "path": "" };
currentSong.changeCurrentSong = changeCurrentSong;

function changeCurrentSong(index, title, artist, album, artwork, path) {
  this.index = index;
  this.title = title;
  this.artist = artist;
  this.album = album;
  this.artwork = artwork;
  this.path = path;
}

//
export function playMusicItem(path, imageUrl, index, songData) {
  audio.stopMusic();
  audio.setAudioSrc(path);
  audio.setOnEnded(index);

  document.getElementById("volumeFill").style.width = (audio.getAudioVolume() * 100) + "%";
  lastSavedVolume = audio.getAudioVolume();

  currentSong.changeCurrentSong(index, songData.title, songData.artist[0], songData.album, imageUrl, audio.getAudioSrc());

  document.getElementsByClassName("song-name")[0].innerHTML = currentSong.title;
  document.getElementsByClassName("artist-name")[0].innerHTML = currentSong.artist;
  document.getElementsByClassName("album-name")[0].innerHTML = currentSong.album;
  document.getElementsByClassName("song-number")[0].innerHTML = (songData.track.of != 0) ? songData.track.no + "/" + songData.track.of : songData.track.no + "/" + songsMetadata.length;

  console.log("Now playing: " + audio.getAudioSrc());
  document.getElementById("albumArtwork").style.backgroundImage = "url(" + currentSong.artwork + ")";
  audio.playMusic();
  config.set("currentSavedSong", currentSong);
}

function loadSavedSong() {
  audio.stopMusic();
  audio.setAudioSrc(currentSong.path);
  audio.setOnEnded(null);

  document.getElementById("volumeFill").style.width = (audio.getAudioVolume() * 100) + "%";
  lastSavedVolume = audio.getAudioVolume();

  document.getElementsByClassName("song-name")[0].innerHTML = currentSong.title;
  document.getElementsByClassName("artist-name")[0].innerHTML = currentSong.artist;
  document.getElementsByClassName("album-name")[0].innerHTML = currentSong.album;
  //document.getElementsByClassName("song-number")[0].innerHTML = (songData.track.of != 0) ? songData.track.no + "/" + songData.track.of : songData.track.no + "/" + songsMetadata.length;

  document.getElementById("albumArtwork").style.backgroundImage = "url(" + currentSong.artwork + ")";
}

class RightColView extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isMuted: false,
    }
  }

  loadConfigFile() {
    if (config.get('currentSavedPlaylist') != undefined) {
      goToFolder(config.get('currentSavedPlaylist'));
    }
    if (config.get('currentSavedSong') != undefined) {
      currentSong = config.get('currentSavedSong');
      currentSong.changeCurrentSong = changeCurrentSong;
      loadSavedSong();
    }
    //console.log("config.store: " + config.store);
  }

  async componentDidMount() {
    await this.loadConfigFile();
    Mousetrap.bind('space', () => this.playButton());
    audio.setAudioVolume(1);
    lastSavedVolume = audio.getAudioVolume();
    this.volumeFillChange(audio.getAudioVolume());
  }

  playButton() {
    if (audio.getAudioSrc() != "") {
      if (!audio.isPaused()) {
        audio.pauseMusic();
      } else {
        audio.playMusic();
      }
    }
  }
  
  backButton(currentSongIndex) {
    if (audio.getAudioSrc() != "") {
      if (currentSongIndex > 0) {
        playMusicItem(musicList[currentSongIndex-1], currentSong.artwork, currentSongIndex-1, songsMetadata[currentSongIndex-1]);
      }
    }
  }
  
  forwardButton(currentSongIndex) {
    if (audio.getAudioSrc() != "") {
      if (currentSongIndex < musicList.length-1) {
        playMusicItem(musicList[currentSongIndex+1], currentSong.artwork, currentSongIndex+1, songsMetadata[currentSongIndex+1]);
      }
    }
  }
  
  jumpToSongTime(event) {
    if (audio.getAudioSrc() != "") {
      var calculate = calcFunctions.calcDivFillPercentage(event, "TimeFill");
      this.timeFillChange(calculate);
      audio.setCurrentTime(audio.getAudioDuration() * (calculate/100));
    }
  }

  changeSongVolume(event) {
    var calculate = calcFunctions.calcDivFillPercentage(event, "VolumeFill");
    this.volumeFillChange(calculate/100);
    audio.setAudioVolume(calculate/100);
  }

  changeSongVolumeByBit(event) {
    var volumeChange = 0;
    if (event.deltaY < 0) {
      //up
      volumeChange = audio.getAudioVolume() + 0.1;
      if (volumeChange > 1) volumeChange = 1;
    } else if (event.deltaY > 0) {
      //down
      volumeChange = audio.getAudioVolume() - 0.1;
      if (volumeChange < 0) volumeChange = 0;
    }
    audio.setAudioVolume(volumeChange);
    this.volumeFillChange(audio.getAudioVolume());
  }

  muteUnmuteButton() {
    if (this.state.isMuted) {
      audio.setAudioVolume(lastSavedVolume);
    } else {
      audio.setAudioVolume(0);
    }
    document.getElementById("volumeFill").style.width = audio.getAudioVolume() * 100 + "%";
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
            <div id="play" className="play" onClick={() => this.playButton()}>
              <FontAwesomeIcon icon={faPlay} />
            </div>
            <div className="next" onClick={() => this.forwardButton(currentSong.index)}><FontAwesomeIcon icon={faForward} /></div>
            <div className="volume" onClick={() => this.muteUnmuteButton()}><FontAwesomeIcon icon={faVolumeUp} /></div>
            <div id="divVolumeFill" onClick={(e) => this.changeSongVolume(e)} onWheel={(e) => this.changeSongVolumeByBit(e)}>
              <div id="volumeFill" />
            </div>
          </div>
          <div className="currently-playing">
            <h3 className="song-number" />
          </div>
        </div>
      </div>
    )
  }
}

export default RightColView;