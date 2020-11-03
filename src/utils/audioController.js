import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import * as calcFunctions from './calcFunctions';
import * as documentFunctions from './documentFunctions';
import { musicList, songsMetadata } from '../components/BottomRowView';
import { playMusicItem } from '../components/MainView';

class audioController {
    constructor() {
        this.audio = new Audio();

        this.audio.ontimeupdate = () => {
            documentFunctions.setInnerHTML('id', 'currentSongTime', calcFunctions.calcTime(this.getCurrentTime()));
            documentFunctions.setElementsWidth('timeFill', calcFunctions.calcProgressBar(this.getAudio()));
        }

        this.audio.onloadedmetadata = () => {
            documentFunctions.setInnerHTML('id', 'currentSongDuration', calcFunctions.calcTime(this.getAudioDuration()));
        }
    }

    setOnEnded(index) {
        this.audio.onended = () => {
            if (index != musicList.length-1) {
                playMusicItem(musicList[index+1], this.getAudioSrc(), index+1, songsMetadata[index+1], true);
            } else {
                this.stopMusic();
            }
        }
    }

    getAudio() {
        return this.audio;
    }

    stopMusic() {
        this.audio.pause();
        this.audio.currentTime = 0;
        ReactDOM.render(<FontAwesomeIcon icon={faPlay} className="icon" />, document.getElementsByClassName('play')[0]);
    }

    pauseMusic() {
        this.audio.pause();
        ReactDOM.render(<FontAwesomeIcon icon={faPlay} className="icon" />, document.getElementsByClassName('play')[0]);
    }

    playMusic() {
        this.audio.play();
        ReactDOM.render(<FontAwesomeIcon icon={faPause} className="icon" />, document.getElementsByClassName('play')[0]);
    }

    getAudioSrc() {
        return this.audio.src;
    }

    setAudioSrc(src) {
        this.audio.src = src;
    }

    getAudioVolume() {
        return this.audio.volume;
    }

    setAudioVolume(volume) {
        this.audio.volume = volume;
    }

    getCurrentTime() {
        return this.audio.currentTime;
    }

    setCurrentTime(time) {
        this.audio.currentTime = time;
    }

    getAudioDuration() {
        return this.audio.duration;
    }

    isPaused() {
        return this.audio.paused;
    }
}

export default audioController;