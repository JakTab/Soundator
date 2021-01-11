/* Imports */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faBackward, faPlay, faForward, faAngleDoubleDown, faAngleDoubleUp } from "@fortawesome/free-solid-svg-icons";
import * as Mousetrap from 'mousetrap';
import './MainView.scss';
import * as calcFunctions from '../utils/calcFunctions';
import audioController from '../utils/audioController';
import BottomRowView, { musicList, songsMetadata, goToFolder } from './BottomRowView';

import configController from '../utils/configController';

import * as documentFunctions from '../utils/documentFunctions';

/* Globals */
var config = new configController();
var audio = new audioController();
var lastSavedVolume;
var toggledBottomView = false;

export var currentSong = { "index": "", "title": "",	"artist": "",	"album": "", "artwork": "", "path": "", "songData": "" };
currentSong.changeCurrentSong = changeCurrentSong;

/* Functions */
function changeCurrentSong(index, title, artist, album, artwork, path, songData) {
  this.index = index;
  this.title = title;
  this.artist = artist;
  this.album = album;
  this.artwork = artwork;
  this.path = path;
  this.songData = songData;
}

export function playMusicItem(path, imageUrl, index, songData, playbackOn) {
  audio.stopMusic();
  audio.setAudioSrc(path);
  audio.setOnEnded(index-1);

  documentFunctions.setElementsWidth('volumeFill', (audio.getAudioVolume() * 100) + "%");
  lastSavedVolume = audio.getAudioVolume();

  currentSong.changeCurrentSong(index, songData.title, songData.artist[0], songData.album, imageUrl, audio.getAudioSrc(), songData);
  config.set("currentSavedSong", currentSong);

  documentFunctions.setInnerHTML('class', 'song-name', currentSong.title);
  documentFunctions.setInnerHTML('class', 'artist-name', currentSong.artist);
  documentFunctions.setInnerHTML('class', 'album-name', currentSong.album);
  documentFunctions.setInnerHTML('class', 'song-number', (songData.track.of != 0) ? songData.track.no + "/" + songData.track.of : songData.track.no + "/" + songsMetadata.length);

  document.getElementById("albumArtwork").style.backgroundImage = "url(" + currentSong.artwork + ")";

  if (playbackOn) {
    audio.playMusic();
  }
}

/* Component class */
class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
        isMuted: false,
    }
  }

  loadConfigFile() {
    if (!config.checkIfUndefined('currentSavedPlaylist')) {
      goToFolder(config.get('currentSavedPlaylist'));
    }
    if (!config.checkIfUndefined('currentSavedSong')) {
      currentSong = config.get('currentSavedSong');
      currentSong.changeCurrentSong = changeCurrentSong;
      playMusicItem(currentSong.path, currentSong.artwork, currentSong.index, currentSong.songData, false);
    }
    if (!config.checkIfUndefined('currentAppTheme')) {
      document.getElementById('app').className = config.get('currentAppTheme');
    }
    //console.log(config.store());
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
    if (audio.getAudioSrc() != "" && currentSongIndex > 0) {
      playMusicItem(musicList[currentSongIndex-1], currentSong.artwork, currentSongIndex-1, songsMetadata[currentSongIndex-1], true);
    }
  }

  forwardButton(currentSongIndex) {
    if (audio.getAudioSrc() != "" && currentSongIndex < musicList.length-1) {
      playMusicItem(musicList[currentSongIndex+1], currentSong.artwork, currentSongIndex+1, songsMetadata[currentSongIndex+1], true);
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
    documentFunctions.setElementsWidth('volumeFill', (audio.getAudioVolume() * 100) + "%");
    this.setState({ isMuted: !this.state.isMuted });
  }

  volumeFillChange(vol) {
    documentFunctions.setElementsWidth('volumeFill', vol * 100 + "%");
    lastSavedVolume = vol;
  }

  timeFillChange(time) {
    documentFunctions.setElementsWidth('timeFill', time + "%");
  }

  toggleBottomMenu() {
    if (!toggledBottomView) {
      documentFunctions.setElementsHeight('info', '100%');
      documentFunctions.setElementsHeight('draggableArea', '0');
      ReactDOM.render(<FontAwesomeIcon icon={faAngleDoubleDown} className="icon scrollIcon" />, document.getElementsByClassName('bottomMenu')[0]);
    } else {
      documentFunctions.setElementsHeight('info', '30%');
      documentFunctions.setElementsHeight('draggableArea', '70%');
      ReactDOM.render(<FontAwesomeIcon icon={faAngleDoubleUp} className="icon scrollIcon" />, document.getElementsByClassName('bottomMenu')[0]);
    }
    toggledBottomView = !toggledBottomView;
  }

  render() {
    return (
      <div id="mainView" className="mainView">
        <div className="album" id="albumArtwork" />
        <div id="draggableArea" className="draggableArea" />
        <div id="info" className="info">
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
            <div className="bottomMenu" onClick={() => this.toggleBottomMenu()}><FontAwesomeIcon icon={faAngleDoubleUp} className="icon"/></div>
            <div className="previous" onClick={() => this.backButton(currentSong.index)}><FontAwesomeIcon icon={faBackward} className="icon" /></div>
            <div className="play" onClick={() => this.playButton()}><FontAwesomeIcon icon={faPlay} className="icon" /></div>
            <div className="next" onClick={() => this.forwardButton(currentSong.index)}><FontAwesomeIcon icon={faForward} className="icon" /></div>
            <div className="volume" onClick={() => this.muteUnmuteButton()}><FontAwesomeIcon icon={faVolumeUp} className="icon" /></div>
            <div id="divVolumeFill" onClick={(e) => this.changeSongVolume(e)} onWheel={(e) => this.changeSongVolumeByBit(e)}>
              <div id="volumeFill" />
            </div>
          </div>
          <div className="song-number-row">
            <h3 className="song-number" />
          </div>
          <div className="bottomRow">
            <BottomRowView />
          </div>
        </div>
      </div>
    )
  }
}

export default MainView;