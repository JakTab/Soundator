const path = require('path');
const url = require('url');
const { app, BrowserWindow, protocol } = require('electron');
const electron = require('electron');

const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

let mainWindow;

let isDev = false;

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
	isDev = true
}

function createMainWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 800,
		maxWidth: 900,
		maxHeight: 900,
		minWidth: 400,
		minHeight: 400,
		maximizable: false,
		show: false,
		frame: isDev ? true : false,
		//frame: false,
		icon: `${__dirname}/assets/icon.ico`,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			nodeIntegrationInWorker: true,
			webSecurity: false,
		},
	})

	let indexPath

	if (isDev && process.argv.indexOf('--noDevServer') === -1) {
		indexPath = url.format({
			protocol: 'http:',
			host: 'localhost:8080',
			pathname: 'index.html',
			slashes: true,
		})
	} else {
		indexPath = url.format({
			protocol: 'file:',
			pathname: path.join(__dirname, 'dist', 'index.html'),
			slashes: true,
		})
		mainWindow.removeMenu(false);
	}

	mainWindow.removeMenu(false);
	mainWindow.loadURL(indexPath);

	//Maintaining aspect ratio when resizing window
	//Fix until Electron decides to implement this feature for Windows
	let oldSize;
	aspectRatioInterval = setInterval(() => {
		oldSize = mainWindow.getSize();
	}, 10);

	mainWindow.on('resize', () => {
		let size = mainWindow.getSize();
		let widthChanged = oldSize[0] != size[0];
		var ratioY2X = 1;
		if (widthChanged)
			mainWindow.setSize(size[0], parseInt((size[0] * ratioY2X).toString()));
		else
			mainWindow.setSize(parseInt((size[1] / ratioY2X).toString()), size[1]);
	});

	// Don't show until we are ready and loaded
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()

		// Open devtools if dev
		if (isDev) {
			const {
				default: installExtension,
				REACT_DEVELOPER_TOOLS,
			} = require('electron-devtools-installer')

			installExtension(REACT_DEVELOPER_TOOLS).catch((err) =>
				console.log('Error loading React DevTools: ', err)
			)
			mainWindow.webContents.openDevTools()
		}
	})

	mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', () => {
	createMainWindow();

	const ctxMenu = new Menu();
	ctxMenu.append(new MenuItem({ role: 'minimize' }));
	ctxMenu.append(new MenuItem({ role: 'close' }));

	mainWindow.webContents.on('context-menu', (e, params) => {
		ctxMenu.popup(mainWindow, params.x, params.y);
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		clearInterval(aspectRatioInterval);
		app.quit();
	}
})

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow()
	}
})

// Stop error
app.allowRendererProcessReuse = true

app.whenReady().then(() => {
	protocol.registerFileProtocol('file', (request, callback) => {
	  const pathname = decodeURI(request.url.replace('file:///', ''));
	  callback(pathname);
	});
});