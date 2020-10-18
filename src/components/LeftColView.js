import React from 'react';
import fs from 'fs';
import mm from 'musicmetadata';

import './LeftColView.scss';

import { playMusicItem } from './RightColView';

export var musicList = [];
export var songMetadata = [];
var musicArray = [];

const remote = require('electron').remote;
const dialog = remote.dialog;

async function getAllFolders() {
	let mainFolder = await dialog.showOpenDialog({ properties: ["openDirectory"] });
	goToFolder(mainFolder);
}

async function goToFolder(mainFolder) {
    musicList = [];
    songMetadata = [];

	document.getElementById("list").innerHTML = "";
	await getItemsToMusicList(mainFolder, -1);

	musicList.forEach((musicListItem, index) => {
		var title = musicListItem.split('.').pop();
		if (title != "txt" && title != "mp3" && title != "jpg" && title != "png" && title != "flac") {
			getItemsToMusicList(musicListItem, index);
		}
    });

	musicList.forEach((musicAlbumItem, index) => {
		if (!Array.isArray(musicAlbumItem)) {
            var title = musicAlbumItem.split('.').pop();
            if (title != "jpg" && title != "png") {
                addToPlaylistAsSong(musicAlbumItem);
            } else {
                musicList.splice(index, 1);
            }
		} else {
            createListItem(false, false, musicAlbumItem, index);
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
        songMetadata.push(metadata);
        createListItem(metadata, path, false, false);
		readableStream.close();
	});
}

function Uint8ArrayToJpgURL(arrayData) {
	var arrayBufferView = new Uint8Array(arrayData);
    var blob = new Blob( [arrayBufferView], { type: "image/jpeg" } );
    return URL.createObjectURL(blob);
}

function createListItem(songData, path, musicAlbumArray, index) {
    let imageUrl = "", artistSong = "", artistName = "", artistAlbum = "", order = "",
        title = "", cutStr = "";

    //listItem
    let musicAlbumItem = document.createElement("div");
    musicAlbumItem.id = "listItem";

    if (songData != false) {
        //Song
        imageUrl = Uint8ArrayToJpgURL(songData.picture[0].data);
        order = songData.track.no-1;
        musicAlbumItem.onclick = () => {
            playMusicItem(path, imageUrl, order, songData);
        }
        artistSong = songData.track.no + ". " + songData.title;
        artistAlbum = songData.artist[0];
        artistName = songData.album;
    } else if (index > -1) {
        //Folder
        console.log(index);
        console.log("! " + musicAlbumArray[0].split('/').pop());
        title = musicAlbumArray[0].split('/').pop();
        console.log(title);
        cutStr = title.indexOf(" - ");
        artistName = title.substring(0, cutStr);
        artistAlbum = title.substring(cutStr+2, title.length);
        order = index;
        musicAlbumItem.onclick = () => {
            goToFolder(musicAlbumArray[0]);
        }
    }

    musicAlbumItem.style.order = order;

    //listItemIng
    let albumCoverItem = document.createElement("div");
    albumCoverItem.id = "listItemImg";

    if (imageUrl != "") {
        let albumCoverImg = document.createElement("img");
        albumCoverImg.src = imageUrl;
        albumCoverItem.appendChild(albumCoverImg);
    }

    //listItemInfo
    let listItemInfo = document.createElement("div");
    listItemInfo.className = "listItemInfo";

    var albumSong = "", albumArtist = "", albumName = "";

    console.log(artistSong);

    if (artistSong != "" && artistSong != undefined) {
        //Song
        albumSong = document.createElement("h2");
        albumSong.className = "listItem-song-name";
        albumSong.innerHTML = artistSong;
        listItemInfo.appendChild(albumSong);
    } 

    if (artistSong == "") {
        //Folder
        albumArtist = document.createElement("h2");
        albumArtist.className = "listItem-song-name";
    } else {
        //Song
        albumArtist = document.createElement("h3");
        albumArtist.className = "listItem-artist-name";

    }
    albumArtist.innerHTML = artistName;
    listItemInfo.appendChild(albumArtist);

    albumName = document.createElement("h3");
    albumName.className = "listItem-album-name";
    albumName.innerHTML = artistAlbum;
    listItemInfo.appendChild(albumName);

	musicAlbumItem.appendChild(albumCoverItem);
    musicAlbumItem.appendChild(listItemInfo);
    
	document.getElementById("list").appendChild(musicAlbumItem);
}

const LeftColView = () => {
    return (
        <div id="leftColView">
			<div id="search" onClick={() => getAllFolders()}></div>
			<div id="list"></div>
		</div>
    )
}

export default LeftColView