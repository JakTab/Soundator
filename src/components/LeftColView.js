import React from 'react';
import { getAllFolders } from './App';
import img from '../../assets/cover.jpg';

const LeftColView = () => {
    return (
        <div id="leftColView">
			<div id="searchView" onClick={() => getAllFolders()}></div>
			<div id="listView">
                <div id="musicAlbumItem" style={{order: 1}}>
                    <div id="albumCoverItem">
                        <img src={img} />
                    </div>
                    <p>Deafear</p>
                    <p>The Waiting</p>
                    <p>1. Grey World</p>
                </div>
            </div>
		</div>
    )
}

export default LeftColView