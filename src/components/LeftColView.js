import React from 'react';
import fs from 'fs';
import mm from 'musicmetadata';

import './LeftColView.scss';

import { playMusicItem } from './RightColView';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import * as filterFunctions from '../utils/filterFunctions';

export var musicList = [];
export var songMetadata = [];

const dialog = require('electron').remote.dialog;

const store = require('electron-store');
const config = new store();

const albumArt = require('album-art');

async function getAllFolders() {
    let mainFolder = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (!mainFolder.canceled) {
        goToFolder(mainFolder);
    }
}

export async function goToFolder(mainFolder) {
    musicList = [];
    songMetadata = [];

	document.getElementById("list").innerHTML = "";
    await getItemsToMusicList(mainFolder);
     
 	musicList.forEach((musicListItem, index) => {
        if (filterFunctions.isStringMusicFile(musicListItem.split('.').pop())) {
            //Song
            addToPlaylistAsSong(musicListItem);
        } else {
            //Folder
            createListItem(false, false, musicListItem, index);
        }
    });

    config.set('currentSavedPlaylist', mainFolder);
}

async function getItemsToMusicList(folder) {
    if (typeof folder === 'object') {
        folder = folder.filePaths[0];
    }

    fs.readdirSync(folder).forEach((folderItem) => {
        if (filterFunctions.isFileAcceptable(folderItem.split('.').pop())) {
            if (folder.endsWith("\\")) {
                musicList.push(folder + folderItem);
            } else {
                musicList.push(folder + "\\" + folderItem);
            }
        }
    });	
}

async function addToPlaylistAsSong(path) {
	var readableStream = fs.createReadStream(path);
	await mm(readableStream, async function (err, metadata) {
        if (err) throw err;
        songMetadata[metadata.track.no-1] = metadata;
        createListItem(metadata, path, false, false);
		readableStream.close();
    });
}

function Uint8ArrayToJpgURL(arrayData) {
	var arrayBufferView = new Uint8Array(arrayData);
    var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
    return URL.createObjectURL(blob);
}

function getAlbumCoverOnline(artistName, albumName) {
    var promise = new Promise(function(resolve, reject) {
        resolve(albumArt(artistName, {album: albumName, size: 'medium'}));
    });
    return promise;
}

async function createListItem(songData, path, musicFolderPath, index) {
    let imageUrl = "", artistSong = "", artistName = "", 
        artistAlbum = "", order = "", title = "", cutStr = "";

    //listItem
    let musicAlbumItem = document.createElement("div");
    musicAlbumItem.id = "listItem";

    if (songData != false) {
        //Song
        if (typeof songData.picture[0] != 'undefined') {
            imageUrl = Uint8ArrayToJpgURL(songData.picture[0].data);
        } else {
            imageUrl = await getAlbumCoverOnline(songData.artist[0], songData.album);
        }

        var currentPath = "";
        var splitPath = path.split('\\').filter(function (el) {
            return el != "";
        });

        splitPath.forEach((element, index) => {
            if (index < splitPath.length - 1) {
                currentPath += element;
                if (index != splitPath.length - 2) {
                    currentPath += "\\"
                }
            }
        })

        order = songData.track.no-1;
        musicAlbumItem.onclick = () => {
            playMusicItem(path, imageUrl, order, songData);
        }
        artistSong = songData.track.no + ". " + songData.title;
        artistAlbum = songData.artist[0];
        artistName = songData.album;
    } else if (index > -1) {
        //Folder
        var folderPathSplit = musicFolderPath.split('\\');
        title = folderPathSplit[folderPathSplit.length-1];
        cutStr = title.indexOf(" - ");
        if (cutStr != -1) {
            artistName = title.substring(0, cutStr);
            artistAlbum = title.substring(cutStr+3, title.length);
        } else {
            artistAlbum = title;
        }
        order = index;
        musicAlbumItem.onclick = () => {
            goToFolder(musicFolderPath);
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

function backFolder() {
    var pathToBackFrom = "", newPath = "", splitLength = "";

    if (typeof config.get('currentSavedPlaylist') === 'object') {
        pathToBackFrom = config.get('currentSavedPlaylist').filePaths[0];
    } else if (typeof config.get('currentSavedPlaylist') === 'string') {
        pathToBackFrom = config.get('currentSavedPlaylist');
    }

    splitLength = pathToBackFrom.split('\\').slice(0, -1).length;

    if (splitLength > 0) {
        pathToBackFrom.split('\\').slice(0, -1).forEach((pathPart, index) => {
            newPath += pathPart;
            if (index < splitLength-1) {
                newPath += "\\";
            }
        });
        goToFolder(newPath);
    }
}

const LeftColView = () => {
    return (
        <div id="leftColView" className="leftColView">
			<div id="search" onClick={() => getAllFolders()} />
			<div id="list" />
            <div id="bottomOptionsBar">
                <div id="folderControlBar">
                    <div id="backFolderControlButton" onClick={() => backFolder()}><FontAwesomeIcon icon={faArrowLeft} /></div>
                    <div id="forwardFolderControlButton" onClick={() => forwardFolder()}><FontAwesomeIcon icon={faArrowRight} /></div>
                </div>
                <div id="notificationBar" />
            </div>
		</div>
    )
}

export default LeftColView