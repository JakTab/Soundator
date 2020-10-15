import React from 'react';
import fs from 'fs';
import mm from 'musicmetadata';

import LeftColView from './LeftColView';
import RightColView, {playMusicItem} from './RightColView';

const remote = require('electron').remote;
const dialog = remote.dialog;

export var musicList = [];
let musicArray = [];

export var currentSong = {
	"index": "1",
	"title": "1",
	"artist": "1",
	"album": "1",
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
	console.log(imageUrl)
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

export function calcTime(time) {
	var minutes = "0" + Math.floor(time / 60);
	var seconds = "0" + Math.floor(time - minutes * 60);
	return minutes.substr(-2) + ":" + seconds.substr(-2);
}

export function calcProgressBar(audio) {
	return "" + (audio.currentTime / audio.duration)*100 + "%";
}

const App = () => {
	return (
		<div className="app">
			<LeftColView />
			<RightColView />
		</div>
	)
}

export default App