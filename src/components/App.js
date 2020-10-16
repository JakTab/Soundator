import React from 'react';

import LeftColView from './LeftColView';
import RightColView from './RightColView';

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