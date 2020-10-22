import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import * as calcFunctions from './calcFunctions';
import { musicList, songsMetadata } from '../components/LeftColView';
import { playMusicItem } from '../components/RightColView';

class audioController {
    constructor() {
        this.audio = new Audio();

        this.audio.ontimeupdate = () => {
            document.getElementById("currentSongTime").innerHTML = calcFunctions.calcTime(this.getCurrentTime());
            document.getElementById("timeFill").style.width = calcFunctions.calcProgressBar(this.getAudio());
        }

        this.audio.onloadedmetadata = () => {
            document.getElementById("currentSongDuration").innerHTML = calcFunctions.calcTime(this.getAudioDuration());
        }
    }

    setOnEnded(index) {
        if (index == null) {
            this.audio.onended = () => {
                this.stopMusic();
            }
        } else {
            this.audio.onended = () => {
                if (index != musicList.length-1) {
                    playMusicItem(musicList[index+1], this.getAudioSrc(), index+1, songsMetadata[index+1]);
                } else {
                    this.stopMusic();
                }
            }
        }
    }

    getAudio() {
        return this.audio;
    }

    stopMusic() {
        this.audio.pause();
        this.audio.currentTime = 0;
        ReactDOM.render(<FontAwesomeIcon icon={faPlay} />, document.getElementById('play'));
    }

    pauseMusic() {
        this.audio.pause();
        ReactDOM.render(<FontAwesomeIcon icon={faPlay} />, document.getElementById('play'));
    }

    playMusic() {
        this.audio.play();
        ReactDOM.render(<FontAwesomeIcon icon={faPause} />, document.getElementById('play'));
    }

    setAudioSrc(src) {
        this.audio.src = src;
    }

    getAudioSrc() {
        return this.audio.src;
    }

    setAudioVolume(volume) {
        this.audio.volume = volume;
    }

    getAudioVolume() {
        return this.audio.volume;
    }

    setCurrentTime(time) {
        this.audio.currentTime = time;
    }

    getCurrentTime() {
        return this.audio.currentTime;
    }

    getAudioDuration() {
        return this.audio.duration;
    }

    isPaused() {
        return this.audio.paused;
    }
}

export default audioController;