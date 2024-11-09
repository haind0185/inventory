import { app, BrowserWindow, globalShortcut } from 'electron';
import { join } from 'path';
import server from '../backend/index';

const startServer = () => {
    const port = 5000
    return server.listen(port, () => {
        console.log(`Express server is running at http://localhost:${port}`);
    });
}

var  sv = startServer()

const restartServer = () => {
    if (sv) {
        sv.close(() => {
            console.log('Server stopped. Restarting...');
            sv = startServer()
        });
    } else {
        sv = startServer()
    }
}

if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'icon.ico')
    : join(__dirname, '../../icon.ico');
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
        },
        icon: iconPath,
    });

    console.log(iconPath)

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    globalShortcut.register('CommandOrControl+E', () => {
        restartServer()
    })
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});