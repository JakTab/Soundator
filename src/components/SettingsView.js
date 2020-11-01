import React, { Component } from 'react';
import * as Store from 'electron-store';

import './SettingsView.scss';

var config = new Store();

export function checkIfSettingsOpen() {
    return !document.getElementById("settingsView").classList.value.includes('hide')
}

function toggleAppTheme(themeName) {
    document.getElementById('app').className = themeName;
    config.set('currentAppTheme', themeName);
}

class SettingsView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="settingsView" className="settingsView hide">
                <div onClick={() => toggleAppTheme('theme-green')} style={{height: '100px', width: '100px', backgroundColor: 'green'}}></div>
                <div onClick={() => toggleAppTheme('theme-yellow')} style={{height: '100px', width: '100px', backgroundColor: 'yellow'}}></div>
            </div>
        );
    }
}

export default SettingsView