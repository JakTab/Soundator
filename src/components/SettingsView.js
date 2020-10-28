import React, { Component } from 'react';

import './SettingsView.scss';

export function checkIfSettingsOpen() {
    return !document.getElementById("settingsView").classList.value.includes('hide')
}

class SettingsView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="settingsView" className="settingsView hide">

            </div>
        );
    }
}

export default SettingsView