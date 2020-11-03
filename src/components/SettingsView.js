/* Imports */
import React, { Component } from 'react';

import './SettingsView.scss';

import configController from '../utils/configController';

/* Globals */
var config = new configController();

var themes = [
    { 'value': 'theme-green', 'name': 'Green', 'color': '#49654D' },
    { 'value': 'theme-yellow', 'name': 'Yellow', 'color': '#656249' },
    { 'value': 'theme-red', 'name': 'Red', 'color': '#654949' },
];

/* Functions */
function toggleAppTheme(event) {
    event.persist();
    document.getElementById('app').className = event.target.value;
    config.set('currentAppTheme', event.target.value);
}

function clearConfig() {
    config.clear();
    require('electron').remote.app.quit();
}

class SettingsView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="settingsView" className="settingsView hide">
                <div>
                    <div className="settingContainer">
                        <p>Application theme: </p>
                        <select onChange={(e) => toggleAppTheme(e)}>
                            {themes.map(team => (
                                <option style={{backgroundColor: team.color}} key={team.value} value={team.value}>{team.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="settingContainer">
                        <p>Clear configuration: </p>
                        <button onClick={() => clearConfig()}>Erase config data</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default SettingsView