/* Imports */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import fs from 'fs';
import mm from 'musicmetadata';
import * as byte64 from 'byte-base64';
import ReactTooltip from 'react-tooltip';

import * as albumArt from 'album-art';

import './BottomRowView.scss';

import { playMusicItem } from './MainView';
import FavoritesView, { favorites } from './FavoritesView';
import SettingsView from './SettingsView';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCog, faFolder, faSearch, faStar, faThumbtack } from '@fortawesome/free-solid-svg-icons';

import * as filterFunctions from '../utils/filterFunctions';
import * as calcFunctions from '../utils/calcFunctions';
import * as documentFunctions from '../utils/documentFunctions';

import configController from '../utils/configController';

/* Globals */
export var musicList = [];
export var songsMetadata = [];
const dialog = require('electron').remote.dialog;
const config = new configController();

var currentMainFolder = "";

/* Functions */
async function getFolders() {
    let mainFolder = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    if (!mainFolder.canceled && mainFolder.filePaths[0] != config.get('currentSavedPlaylist')) {
        goToFolder(mainFolder);
    }
}

export async function goToFolder(mainFolder) {
    cleanSearchFieldInput();
    musicList = [];
    songsMetadata = [];
    currentMainFolder = mainFolder;

    documentFunctions.setInnerHTML('id', 'list', '');
    await getItemsToMusicList(mainFolder);
     
 	musicList.forEach((musicListItem, index) => {
        //If - Song; Else - Folder
        (filterFunctions.isStringMusicFile(musicListItem.split('.').pop())) ? addToPlaylistAsSong(musicListItem) : createListItem(false, false, false, musicListItem, index);
    });

    config.set('currentSavedPlaylist', mainFolder);
}

async function getItemsToMusicList(folder) {
    if (typeof folder === 'object') {
        folder = folder.filePaths[0];
    }

    fs.readdirSync(folder).forEach((folderItem) => {
        folderItem = (folder.endsWith("\\")) ? folder + folderItem : folder + "\\" + folderItem;

        if (!filterFunctions.folderNotPermitted(folderItem)) {
            if (fs.statSync(folderItem).isDirectory() || filterFunctions.isStringMusicFile(folderItem.split('.').pop())) {
                musicList.push(folderItem);
            }
        }
    });
}

function addToPlaylistAsSong(path) {
	var readableStream = fs.createReadStream(path);
    mm(readableStream, { duration: true }, function (err, metadata) {
        if (err) throw err;
        songsMetadata.push(metadata);
        createListItem(metadata, path, songsMetadata.length, false, false);
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

async function createListItem(songData, path, orderIndex, musicFolderPath, index) {
    let imageUrl = "", artistSong = "", artistName = "", 
        artistAlbum = "", trackLength = "", order = "", title = "", cutStr = "";

    let isFolder = songData != false ? false : true;

    //listItem
    let musicAlbumItem = documentFunctions.generateElement('div', 'listItem', '');

    if (!isFolder) {
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
        order = orderIndex;
        musicAlbumItem.onclick = () => {
            playMusicItem(path, imageUrl, order, songData, true);
        }
    } else {
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
    let albumCoverItem = documentFunctions.generateElement('div', 'listItemImg', '');

    if (imageUrl != "") {
        let albumCoverImg = documentFunctions.generateElement('img', '', '');
        albumCoverImg.src = imageUrl;
        albumCoverItem.appendChild(albumCoverImg);
    }

    //listItemInfo
    let listItemInfo = documentFunctions.generateElement('div', '', 'listItemInfo');

    var albumSong = "", albumArtist = "", albumName = "";

    if (!isFolder) {
        //Song
        albumSong = documentFunctions.generateElement('h2', '', 'listItem-song-name');
        documentFunctions.setInnerHTMLToObject(albumSong, artistSong);
        listItemInfo.appendChild(albumSong);
    }

    albumArtist = isFolder ? documentFunctions.generateElement('h2', '', 'listItem-folder-name') : documentFunctions.generateElement('h3', '', 'listItem-artist-name');
    documentFunctions.setInnerHTMLToObject(albumArtist, artistName);
    listItemInfo.appendChild(albumArtist);

    albumName = documentFunctions.generateElement('h3', '', 'listItem-album-name');
    documentFunctions.setInnerHTMLToObject(albumName, artistAlbum);
    listItemInfo.appendChild(albumName);

    var albumSongLength = documentFunctions.generateElement('h3', '', 'listItem-song-length');
    documentFunctions.setInnerHTMLToObject(albumSongLength, trackLength);
    listItemInfo.appendChild(albumSongLength);
    
    musicAlbumItem.appendChild(albumCoverItem);
    musicAlbumItem.appendChild(listItemInfo);
    document.getElementById("list").appendChild(musicAlbumItem);
}

function backFolder() {
    var pathToBackFrom = "", newPath = "", splitLength = "";

    pathToBackFrom = config.checkIfObjectOrString('currentSavedPlaylist');

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
    if (event.dataTransfer.files.length == 1) {
        for (const [key, value] of Object.entries(draggedFilesObj)) {
            value.type == "" ? goToFolder(value.path) : addToPlaylistAsSong(value.path);
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

function toggleSearch(isButtonClicked) {
    if (isButtonClicked || (!isButtonClicked && !documentFunctions.includesClass('searchField', 'hide'))) {
        documentFunctions.toggleClass('searchField', 'hide');
    }
}

function toggleSettings() {
    if (documentFunctions.includesClass('favoritesView', 'hide')) {
        documentFunctions.toggleClass('settingsView', 'hide');
    }
}

function toggleFavorites() {
    if (documentFunctions.includesClass('settingsView', 'hide')) {
        documentFunctions.toggleClass('favoritesView', 'hide');
    }
}

function searchThroughPlaylist(e) {
    var searchedValue = e.target.value.toLowerCase().trim();
    documentFunctions.setInnerHTML('id', 'list', '');
    musicList.forEach((musicItem, index) => {
        var splitMusicItem = musicItem.split('\\');
        if(splitMusicItem[splitMusicItem.length-1].toLowerCase().includes(searchedValue)) {
            (typeof songsMetadata[index] == 'undefined') ? createListItem(false, false, false, musicItem, index) : addToPlaylistAsSong(musicItem);
        }
    })
}

function cleanSearchFieldInput() {
    documentFunctions.setValue('id', 'searchFieldInput', '');
    toggleSearch(false);
}

function addToFavorites() {
    let musicFolderPath = "", title = "";

    if (config.checkIfUndefined('favoritesList')) {
        config.set('favoritesList', []);
    }

    if (typeof currentMainFolder == "object") {
        musicFolderPath = currentMainFolder.filePaths[0];
    } else if (typeof currentMainFolder == "string") {
        musicFolderPath = currentMainFolder;
    }

    var splitMusicItem = musicFolderPath.split('\\');
    title = splitMusicItem[splitMusicItem.length-1];

    console.log([musicFolderPath, title]);

    var favoriteItem = {
        'value': musicFolderPath,
        'title': title
    }

    var favoritesList = config.get('favoritesList');
    var index = favoritesList.map(function(favorite) { return favorite.value; }).indexOf(favoriteItem.value);

    if (index > -1) {
        favoritesList.splice(index, 1);
        config.set('favoritesList', favoritesList);
    } else {
        config.set('favoritesList', [...favoritesList, favoriteItem]);
    }
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
                        <div onClick={() => toggleSearch(true)}><FontAwesomeIcon icon={faSearch} className="icon menuIcon" data-tip="Search in playlist" /></div>
                        <div onClick={() => backFolder()}><FontAwesomeIcon icon={faArrowLeft} className="icon menuIcon" data-tip="Back" /></div>
                        <div onClick={() => getFolders()}><FontAwesomeIcon icon={faFolder} className="icon menuIcon" data-tip="Load folder to playlist" /></div>
                        <div onClick={() => toggleSettings()}><FontAwesomeIcon icon={faCog} className="icon menuIcon" data-tip="Settings" /></div>
                        <div onClick={() => addToFavorites()}><FontAwesomeIcon icon={faThumbtack} className="icon menuIcon" data-tip="Add Current Folder to Favorites" /></div>
                        <div onClick={() => toggleFavorites()}><FontAwesomeIcon icon={faStar} className="icon menuIcon" data-tip="Favorites" /></div>
                    </div>
                </div>
                <div id="searchField" className="searchField">
                    <input id="searchFieldInput" type="search" onChange={(e) => searchThroughPlaylist(e) }/>
                </div>
                <div id="list" onDrop={(e) => getDraggedFileData(e)} onDragOver={(e) => onDragOverList(e)} onDragEnter={(e) => onDragEnterList(e)} onDragLeave={(e) => onDragLeaveList(e)} />
                <SettingsView />
                <FavoritesView />
            </div>
        )
    }
}

export default BottomRowView