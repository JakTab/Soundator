import React from 'react';

import MainView from './MainView';

import '../themes/Themes.scss';
import './App.scss';

const App = () => {
	return (
		<div id="app" className="theme-green">
			<MainView />
		</div>
	)
}

export default App