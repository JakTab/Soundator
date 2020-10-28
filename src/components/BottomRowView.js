/* Imports */
import React, { Component } from 'react';
import fs from 'fs';
import mm from 'musicmetadata';
import * as byte64 from 'byte-base64';
import ReactTooltip from 'react-tooltip';

import './BottomRowView.scss';

import { playMusicItem } from './MainView';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCog, faFolder, faSearch } from '@fortawesome/free-solid-svg-icons';
import * as filterFunctions from '../utils/filterFunctions';
import * as calcFunctions from '../utils/calcFunctions';

/* Globals */
export var musicList = [];
export var songsMetadata = [];
const dialog = require('electron').remote.dialog;
const store = require('electron-store');
const config = new store();
const albumArt = require('album-art');

/* Functions */
async function getAllFolders() {
    let mainFolder = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    console.log(mainFolder);
    if (!mainFolder.canceled && mainFolder.filePaths[0] != config.get('currentSavedPlaylist')) {
        goToFolder(mainFolder);
    }
}

export async function goToFolder(mainFolder) {
    cleanSearchFieldInput();
    musicList = [];
    songsMetadata = [];

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
        if (folder.endsWith("\\")) {
            folderItem = folder + folderItem;
        } else {
            folderItem = folder + "\\" + folderItem;
        }
        if (!filterFunctions.folderNotPermitted(folderItem)) {
            if (fs.statSync(folderItem).isDirectory() || filterFunctions.isStringMusicFile(folderItem.split('.').pop())) {
                musicList.push(folderItem);
            }
        }
    });	
}

async function addToPlaylistAsSong(path) {
	var readableStream = fs.createReadStream(path);
	await mm(readableStream, { duration: true }, async function (err, metadata) {
        if (err) throw err;
        songsMetadata[metadata.track.no-1] = metadata;
        createListItem(metadata, path, false, false);
		readableStream.close();
    });
}

function Uint8ArrayToJpgURL(arrayData) {
    return "data:image/png;base64," + byte64.bytesToBase64(arrayData);
}

function getAlbumCoverOnline(artistName, albumName) {
    var promise = new Promise(function(resolve, reject) {
        resolve(albumArt(artistName, {album: albumName, size: 'medium'}));
    });
    return promise;
}

async function createListItem(songData, path, musicFolderPath, index) {
    let imageUrl = "", artistSong = "", artistName = "", 
        artistAlbum = "", trackLength = "", order = "", title = "", cutStr = "";

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
        artistSong = songData.track.no + ". " + songData.title;
        artistAlbum = songData.artist[0];
        artistName = songData.album;
        if (!Number.isNaN(songData.duration)) {
            trackLength = calcFunctions.calcTime(songData.duration);
        }
        order = songData.track.no-1;
        musicAlbumItem.onclick = () => {
            playMusicItem(path, imageUrl, order, songData);
        }
    } else if (index > -1) {
        //Folder
        var folderPathSplit = musicFolderPath.split('\\');
        title = folderPathSplit[folderPathSplit.length-1];
        cutStr = title.indexOf(" - ");
        if (cutStr != -1) {
            artistName = title.substring(0, cutStr);
            artistAlbum = title.substring(cutStr+3, title.length);
        } else {
            artistName = title;
            artistAlbum = "";
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

    var albumSongLength = document.createElement("h3");
    albumSongLength.className = "listItem-song-length";
    albumSongLength.innerHTML = trackLength;
    listItemInfo.appendChild(albumSongLength);

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

function getDraggedFileData(event) {
    event.preventDefault(); 
    event.stopPropagation();
    const draggedFilesObj = event.dataTransfer.files;
    console.log(draggedFilesObj);
    if (event.dataTransfer.files.length == 1) {
        for (const [key, value] of Object.entries(draggedFilesObj)) {
            if (value.type == "") {
                goToFolder(value.path);
            } else {
                addToPlaylistAsSong(value.path);
            }
        }
    }
}

function onDragOverList(event) {
    event.preventDefault(); 
    event.stopPropagation();
}

function onDragEnterList(event) {
    event.preventDefault();  
}

function onDragLeaveList(event) {
    event.preventDefault(); 
}

function toggleSearch() {
    document.getElementById("searchField").classList.toggle("hide");
}

function searchThroughPlaylist(e) {
    var searchedValue = e.target.value.toLowerCase().trim();
    document.getElementById("list").innerHTML = "";
    musicList.forEach((musicItem, index) => {
        var splitMusicItem = musicItem.split('\\');
        if(splitMusicItem[splitMusicItem.length-1].toLowerCase().includes(searchedValue)) {
            if (typeof songsMetadata[index] == 'undefined') {
                //Folder
                createListItem(false, false, musicItem, index);
            } else {
                //Song
                addToPlaylistAsSong(musicItem);
            }
        }
    })
}

function cleanSearchFieldInput() {
    document.getElementById("searchFieldInput").value = "";
    toggleSearch();
}

/* Component class */
class BottomRowView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="bottomRowView" className="bottomRowView">
                <ReactTooltip />
                <div id="bottomOptionsBar">
                    <div id="folderControlBar">
                        <div onClick={() => toggleSearch()}><FontAwesomeIcon icon={faSearch} className="icon menuIcon" data-tip="Search in playlist" /></div>
                        <div onClick={() => backFolder()}><FontAwesomeIcon icon={faArrowLeft} className="icon menuIcon" data-tip="Back" /></div>
                        <div onClick={() => getAllFolders()}><FontAwesomeIcon icon={faFolder} className="icon menuIcon" data-tip="Load folder to playlist" /></div>
                        <div onClick={() => forwardFolder()}><FontAwesomeIcon icon={faArrowRight} className="icon menuIcon" data-tip="Forward" /></div>
                        <div><FontAwesomeIcon icon={faCog} className="icon menuIcon" data-tip="Settings" /></div>
                    </div>
                </div>
                <div id="searchField" className="searchField hide">
                    <input id="searchFieldInput" type="search" onChange={(e) => searchThroughPlaylist(e) }/>
                </div>
                <div id="list" onDrop={(e) => getDraggedFileData(e)} onDragOver={(e) => onDragOverList(e)} onDragEnter={(e) => onDragEnterList(e)} onDragLeave={(e) => onDragLeaveList(e)}/>
            </div>
        )
    }
}

export default BottomRowView