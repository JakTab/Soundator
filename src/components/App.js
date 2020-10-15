import React from 'react';
import img from '../../assets/cover.jpg';
import fs from 'fs';
import mm from 'musicmetadata';

import LeftColView from './LeftColView';

var remote = require('electron').remote;
var dialog = remote.dialog;

let musicList = [];
let musicArray = [];
let audio = new Audio();

let currentSong = {
	"index": "",
	"title": "Lorem Ipsum",
	"artist": "Lorem Ipsum",
	"album": "Lorem Ipsum",
	"artwork": ""
};

export async function getAllFolders() {
	let mainFolder = await dialog.showOpenDialog({ properties: ["openDirectory"] });
	goToFolder(mainFolder);
}

async function goToFolder(mainFolder) {
	musicList = [];
	document.getElementById("listView").innerHTML = "";
	await getItemsToMusicList(mainFolder, -1);

	musicList.forEach((musicListItem, index) => {
		var title = musicListItem.split('.').pop();
		if (title != "txt" && title != "mp3" && title != "jpg" && title != "png" && title != "flac") {
			getItemsToMusicList(musicListItem, index);
		}
	});

	musicList.forEach((musicAlbumItem, index) => {
		if (!Array.isArray(musicAlbumItem)) {
			addToPlaylistAsSong(musicAlbumItem);
		} else {
			addToPlaylistAsAlbum(musicAlbumItem, index);
		}
	})
}

async function getItemsToMusicList(folder, index) {
	if (index == -1) {
		if(typeof folder === 'object'){
			fs.readdirSync(folder.filePaths[0]).forEach((folderItem) => {
				musicList.push(folder.filePaths[0] + "/" + folderItem);
			});
		} else if (typeof folder === 'string') {
			fs.readdirSync(folder).forEach((folderItem) => {
				musicList.push(folder + "/" + folderItem);
			});
		}
	} else {
		musicArray = [];
		musicArray.push(folder);
		fs.readdirSync(folder).forEach((folderItem) => {
			musicArray.push(folder + "/" + folderItem);
		});
		musicList[index] = musicArray;
	}	
}

async function addToPlaylistAsSong(musicAlbumSong) {
	var path = musicAlbumSong;
	var readableStream = fs.createReadStream(musicAlbumSong);
	await mm(readableStream, async function (err, metadata) {
		if (err) throw err;
		console.log(metadata);
		createItem(metadata, path);
		readableStream.close();
	});
}

function Uint8ArrayToJpgURL(arrayData) {
	var arrayBufferView = new Uint8Array(arrayData);
    var blob = new Blob( [arrayBufferView], { type: "image/jpeg" } );
    return URL.createObjectURL(blob);
}

function createItem(songData, path) {
	var imageUrl = Uint8ArrayToJpgURL(songData.picture[0].data);

	let musicAlbumItem = document.createElement("div");
	musicAlbumItem.id = "musicAlbumItem";
	musicAlbumItem.style.order = songData.track.no;
	musicAlbumItem.onclick = () => {
		playMusicItem(path, imageUrl, songData.track.no-1);
	}

	let albumCoverItem = document.createElement("div");
	albumCoverItem.id = "albumCoverItem";
	let songCover = document.createElement("img");
	songCover.src = imageUrl;
	albumCoverItem.appendChild(songCover);

	let albumArtist = document.createElement("p");
	albumArtist.innerHTML = songData.artist[0];
	let albumName = document.createElement("p");
	albumName.innerHTML = songData.album;
	let songName = document.createElement("p");
	songName.innerHTML = songData.track.no + ". " + songData.title;

	musicAlbumItem.appendChild(albumCoverItem);
	musicAlbumItem.appendChild(albumArtist);
	musicAlbumItem.appendChild(albumName);
	musicAlbumItem.appendChild(songName);
	document.getElementById("listView").appendChild(musicAlbumItem);
}

async function addToPlaylistAsAlbum(musicAlbumArray, index) {
	let title = musicAlbumArray[0].split('/').pop();
	let cutStr = title.indexOf(" - ");
	let artistName = title.substring(0, cutStr);
	let artistAlbum = title.substring(cutStr+2, title.length);
	
	let musicAlbumItem = document.createElement("div");
	musicAlbumItem.id = "musicAlbumItem";
	musicAlbumItem.onclick = () => {
		goToFolder(musicAlbumArray[0])
	}
	let albumCoverItem = document.createElement("div");
	albumCoverItem.id = "albumCoverItem";
	let albumArtist = document.createElement("p");
	albumArtist.innerHTML = artistName;
	let albumName = document.createElement("p");
	albumName.innerHTML = artistAlbum;

	musicAlbumItem.appendChild(albumCoverItem);
	musicAlbumItem.appendChild(albumArtist);
	musicAlbumItem.appendChild(albumName);
	document.getElementById("listView").appendChild(musicAlbumItem);
}

function playMusicItem(path, imageUrl, index) {
	audio.pause();
	audio.src = path;
	audio.currentTime = 0;
	currentSong.index = index;
	currentSong.artwork = imageUrl;
	audio.ontimeupdate = () => {
		document.getElementById("currentSongTime").innerHTML = calcTime(audio.currentTime);
	}
	audio.onloadedmetadata = function() {
		document.getElementById("currentSongDuration").innerHTML = calcTime(audio.duration);
	};
	audio.onended = () => {
		if (index != musicList.length-1 && index > -1) {
			playMusicItem(musicList[index+1], audio.src, index+1);
		} else {
			audio.pause();
		}
	}
	console.log("Now playing: " + audio.src);
	document.getElementById("albumArtwork").src = currentSong.artwork;
	audio.play();
}

function calcTime(time) {
	var minutes = "0" + Math.floor(time / 60);
	var seconds = "0" + Math.floor(time - minutes * 60);
	return minutes.substr(-2) + ":" + seconds.substr(-2);
}

async function playButton() {
	if (!audio.paused) {
		audio.pause();
	} else {
		audio.play();
	}
}

async function backButton(currentSongIndex) {
	console.log("BACK!");
	if (currentSongIndex > 0) {
		playMusicItem(musicList[currentSongIndex-1], currentSong.artwork, currentSongIndex-1);
	}
}

function forwardButton(currentSongIndex) {
	console.log("FORWARD!");
	if (currentSongIndex < musicList.length-1) {
		playMusicItem(musicList[currentSongIndex+1], currentSong.artwork, currentSongIndex+1);
	}
}

const App = () => {
	return (
		<div className="app">
			<LeftColView />
			<div id="rightColView">
				<div id="songView">
					<div id="artworkView">
						<img id="albumArtwork" src={img} />
					</div>
					<div id="songTitlesView">
						<h1>{currentSong.title}</h1>
						<h2>{currentSong.artist}</h2>
						<h2>{currentSong.album}</h2>
					</div>
				</div>
				<div id="controlsView">
					<div id="timeView">
						<h1 id="currentSongTime"></h1>
						<h1 id="currentSongDuration"></h1>
					</div>
					<div id="buttonsView">
						<div id="playButtonItem" onClick={() => playButton()}>PLAY</div>
						<div id="backButtonItem" onClick={() => backButton(currentSong.index)}>BACK</div>
						<div id="forwardButtonItem" onClick={() => forwardButton(currentSong.index)}>FORWARD</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App