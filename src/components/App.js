import React from 'react'
import img from '../components/cover.jpg'
import fs from 'fs';
import mm from 'musicmetadata';

var remote = require('electron').remote;
var dialog = remote.dialog;

let musicList = [];
let musicArray = [];
let audio = new Audio();

async function getAllFolders() {
	let mainFolder = await dialog.showOpenDialog({ properties: ["openDirectory"] });
	goToFolder(mainFolder);
}

async function goToFolder(mainFolder) {
	console.log(mainFolder);
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
		console.log("!!! " + musicAlbumItem);
		if (!Array.isArray(musicAlbumItem)) {
			addToPlaylistAsSong(musicAlbumItem)
		} else {
			addToPlaylistAsAlbum(musicAlbumItem, index);
		}
	})
}

async function getItemsToMusicList(folder, index) {
	if (index == -1) {
		console.log(typeof folder)
		if(typeof folder === 'object'){
			fs.readdirSync(folder.filePaths[0]).forEach((folderItem) => {
				musicList.push(folder.filePaths[0] + "/" + folderItem);
			});
		} else if (typeof folder === 'string') {
			fs.readdirSync(folder).forEach((folderItem) => {
				musicList.push(folder + "/" + folderItem);
			});
			console.log(musicList);
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

function createItem(songData, path) {
	console.log(path);
	var arrayBufferView = new Uint8Array( songData.picture[0].data );
    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    var imageUrl = URL.createObjectURL( blob );
    
	let musicAlbumItem = document.createElement("div");
	musicAlbumItem.id = "musicAlbumItem";
	musicAlbumItem.style.order = songData.track.no;
	musicAlbumItem.onclick = () => {
		playMusicItem(path, imageUrl);
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

function playMusicItem(path, imageUrl) {
	audio.pause();
	audio.src = path;
	audio.currentTime = 0;
	console.log(audio.src);
	document.getElementById("artworkView").firstChild.src = imageUrl;
	audio.play();
}

async function playButton() {
	if (!audio.paused){
		audio.pause();
	} else {
		audio.play();
	}
}

const App = () => {
	return (
		<div className="app">
			<div id="leftColView">
				<div id="searchView" onClick={getAllFolders}></div>
				<div id="listView"></div>
			</div>
			<div id="rightColView">
				<div id="songView">
					<div id="artworkView">
						<img src={img} />
					</div>
					<div id="songTitlesView">
						<h1>Blob</h1>
						<h2>Blobers</h2>
					</div>
				</div>
				<div id="controlsView">
					<div id="timeView"></div>
					<div id="buttonsView">
						<div id="playButtonItem" onClick={playButton}>PLAY</div>
						<div>BACK</div>
						<div>FORWARD</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App