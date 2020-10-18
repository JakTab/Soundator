import React from 'react';

import LeftColView from './LeftColView';
import RightColView from './RightColView';

import './App.scss';

const App = () => {
	return (
		<div className="app">
			<LeftColView />
			<RightColView />
		</div>
	)
}

export default App